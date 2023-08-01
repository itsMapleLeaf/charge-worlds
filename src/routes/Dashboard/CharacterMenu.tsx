import { api } from "convex/_generated/api"
import { type Id } from "convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { LucideUserPlus } from "lucide-react"
import {
	Suspense,
	useState,
	type ComponentPropsWithoutRef,
	type ReactElement,
} from "react"
import { css, cx } from "styled-system/css"
import { flex } from "styled-system/patterns"
import { Field } from "~/components/Field"
import { Menu, MenuButton, MenuItem, MenuPanel } from "~/components/Menu"
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
} from "~/components/Modal"
import { Spinner } from "~/components/Spinner"
import { useQuerySuspense } from "~/convex"
import { useAsyncCallback } from "~/helpers/useAsyncCallback"
import { getSessionId } from "~/session"
import { input } from "~/styles/input"

export function CharacterMenu({ children }: { children: ReactElement }) {
	const [open, setOpen] = useState(false)

	const [characterDialogOpen, setCharacterDialogOpen] = useState(false)
	const [characterDialogId, setCharacterDialogId] = useState<Id<"characters">>()
	const sessionId = getSessionId()
	const characters = useQuerySuspense(api.characters.list)

	const create = useAsyncCallback(useMutation(api.characters.create), {
		onSuccess: (id) => {
			setOpen(false)
			setCharacterDialogId(id)
			setCharacterDialogOpen(true)
		},
	})

	return (
		<>
			<Menu open={open} onOpenChange={setOpen}>
				<MenuButton asChild>{children}</MenuButton>
				<MenuPanel side="top" align="center">
					{characters.map((character) => (
						<MenuItem
							key={character._id}
							onClick={() => {
								setCharacterDialogId(character._id)
								setCharacterDialogOpen(true)
							}}
						>
							{character.name}
						</MenuItem>
					))}

					<MenuItem
						onClick={(event) => {
							event.preventDefault()
							create({ sessionId })
						}}
					>
						{create.loading ? <Spinner size={8} /> : <LucideUserPlus />}
						{create.loading ? null : "Create Character"}
					</MenuItem>
				</MenuPanel>
			</Menu>

			<Modal open={characterDialogOpen} onOpenChange={setCharacterDialogOpen}>
				<ModalContent>
					<Suspense fallback={<Spinner size={8} />}>
						{characterDialogId && (
							<CharacterEditor characterId={characterDialogId} />
						)}
					</Suspense>
				</ModalContent>
			</Modal>
		</>
	)
}

function CharacterEditor({ characterId }: { characterId: Id<"characters"> }) {
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
			return update({ sessionId, id: characterId, ...args })
		},
		{
			spinDelayOptions: {
				delay: 0,
			},
		},
	)

	return (
		<>
			<ModalHeader>
				<ModalTitle>
					<span
						className={css({ flex: 1, opacity: character.name ? 1 : 0.75 })}
					>
						{character.name || "Unnamed"}
					</span>
				</ModalTitle>
				<Spinner
					size={5}
					style={{ opacity: handleChange.loading ? 1 : 0 }}
					className={css({ transition: "opacity" })}
				/>
			</ModalHeader>
			<div className={flex({ p: 4, flexDir: "column", gap: 3 })}>
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
		</>
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
