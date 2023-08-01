import { api } from "convex/_generated/api"
import { type Id } from "convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { type ComponentPropsWithoutRef } from "react"
import { css, cx } from "styled-system/css"
import { flex } from "styled-system/patterns"
import { Field } from "~/components/Field"
import { useQuerySuspense } from "~/convex"
import { useAsyncCallback } from "~/helpers/useAsyncCallback"
import { getSessionId } from "~/session"
import { input } from "~/styles/input"

export function CharacterEditor({
	characterId,
	onLoadingChange,
}: {
	characterId: Id<"characters">
	onLoadingChange?: (loading: boolean) => void
}) {
	const character = useQuerySuspense(api.characters.get, { id: characterId })
	const sessionId = getSessionId()
	const me = useQuerySuspense(api.auth.me, { sessionId })

	const update = useMutation(api.characters.update).withOptimisticUpdate(
		(store, args) => {
			store.setQuery(
				api.characters.get,
				{ id: args.id },
				{ ...character, ...args },
			)
		},
	)

	const handleChange = useAsyncCallback(
		(args: { name?: string; condition?: string }) => {
			onLoadingChange?.(true)
			return update({ sessionId, id: characterId, ...args })
		},
		{
			onSettled: () => onLoadingChange?.(false),
			spinDelayOptions: {
				delay: 0,
			},
		},
	)

	return (
		<div className={flex({ flexDir: "column", gap: 3 })}>
			<Field label="Name" inputId="name">
				<CharacterEditorInput
					id="name"
					type="text"
					placeholder="What should we call you?"
					readOnly={!me.isPlayer}
					className={input()}
					value={character.name}
					onChange={(event) => {
						handleChange({ name: event.target.value })
					}}
				/>
			</Field>
			<Field label="Condition" inputId="condition">
				<CharacterEditorInput
					id="condition"
					type="text"
					placeholder="How are you doing?"
					readOnly={!me.isPlayer}
					className={input()}
					value={character.condition}
					onChange={(event) => {
						handleChange({ condition: event.target.value })
					}}
				/>
			</Field>
		</div>
	)
}

function CharacterEditorInput({
	readOnly,
	value,
	className,
	...props
}: ComponentPropsWithoutRef<"input">) {
	return readOnly ? (
		<div {...props} className={cx(input(), className)}>
			{value || (
				<span className={css({ opacity: value ? 1 : 0.6 })}>No value</span>
			)}
		</div>
	) : (
		<input
			autoComplete="off"
			value={value}
			{...props}
			className={cx(input(), className)}
		/>
	)
}
