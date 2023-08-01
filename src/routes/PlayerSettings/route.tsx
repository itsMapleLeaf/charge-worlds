import { useMutation } from "convex/react"
import { api } from "convex/_generated/api"
import { type Id } from "convex/_generated/dataModel"
import { LucidePlus, LucideX } from "lucide-react"
import { Suspense } from "react"
import { css, cx } from "styled-system/css"
import { flex, grid, hstack } from "styled-system/patterns"
import { z } from "zod"
import { zfd } from "zod-form-data"
import { Field } from "~/components/Field"
import { Spinner } from "~/components/Spinner"
import { useQuerySuspense } from "~/convex"
import { ErrorText } from "~/errors/ErrorText"
import { toError } from "~/errors/helpers"
import { useAsyncCallback } from "~/helpers/useAsyncCallback"
import { useFormSubmit } from "~/helpers/useFormSubmit"
import { button } from "~/styles/button"
import { input } from "~/styles/input"
import {
    settingsPageMainHeading,
    settingsPageSecondaryHeading
} from "~/styles/settings"
import { useRequiredAdminUser } from "~/user/useRequiredAdminUser"

export function PlayerSettings() {
	return (
		<main className={css({ flex: 1 })}>
			<h2 className={settingsPageMainHeading}>Player Settings</h2>
			<p className={css({ color: "base.200" })}>
				Add players to allow them to participate in the game.
			</p>
			<Suspense fallback={<Spinner size={8} />}>
				<h3 className={settingsPageSecondaryHeading}>Add Player</h3>
				<AddPlayerForm />
				<h3 className={settingsPageSecondaryHeading}>Players</h3>
				<PlayerList />
			</Suspense>
		</main>
	)
}

function AddPlayerForm() {
	const { sessionId } = useRequiredAdminUser()
	const add = useMutation(api.players.add)
	const players = useQuerySuspense(api.players.list, { sessionId })

	const handleSubmit = useFormSubmit({
		schema: zfd.formData({
			discordUserId: zfd.text(
				z.string().regex(/^\d+$/, "Invalid Discord User ID"),
			),
		}),
		onSubmit: async ({ discordUserId }, event) => {
			if (players.some((player) => player.discordUserId === discordUserId)) {
				throw new Error("Player already added")
			}

			const form = event.currentTarget
			await add({ sessionId, discordUserId })
			form.reset()
		},
	})

	return (
		<form onSubmit={handleSubmit}>
			<fieldset
				className={flex({ align: "end", gap: 2 })}
				disabled={handleSubmit.loading}
			>
				<Field
					label="Discord User ID"
					inputId="discordUserId"
					className={css({ flex: 1 })}
				>
					<input
						id="discordUserId"
						name="discordUserId"
						type="text"
						placeholder="000000000000000001"
						required
						className={cx(input(), css({ fontVariantNumeric: "tabular-nums" }))}
						onFocus={(event) => event.target.select()}
					/>
				</Field>
				{handleSubmit.loading ? (
					<p>Adding...</p>
				) : (
					<button className={button()} type="submit">
						<LucidePlus /> Add
					</button>
				)}
			</fieldset>

			{handleSubmit.error ? (
				<ErrorText className={css({ mt: 2 })}>
					{toError(handleSubmit.error).message}
				</ErrorText>
			) : null}
		</form>
	)
}

function PlayerList() {
	const { sessionId } = useRequiredAdminUser()
	const players = useQuerySuspense(api.players.list, { sessionId })
	return players.length > 0 ? (
		<ul className={grid({ gridTemplateColumns: "1fr auto", gap: 2 })}>
			{players.map((player) => (
				<li key={player._id} className={css({ display: "contents" })}>
					<PlayerListItem {...player} />
					<RemovePlayerButton id={player._id} />
				</li>
			))}
		</ul>
	) : (
		<p className={css({ opacity: 0.7 })}>No players added yet.</p>
	)
}

function PlayerListItem({
	name,
	discordUserId,
}: {
	name: string | undefined | null
	discordUserId: string
}) {
	return (
		<p
			className={hstack({
				px: 3,
				py: 1.5,
				bg: "base.800",
				borderWidth: 1,
				borderColor: "base.700",
				rounded: "md",
				columnGap: 1.5,
				rowGap: 0,
				flexWrap: "wrap",
			})}
		>
			<span className={css({ minW: 0, opacity: name ? 1 : 0.75 })}>
				{name ?? "Unknown"}
			</span>
			<span
				className={css({
					opacity: 0.5,
					minW: 0,
					fontVariantNumeric: "tabular-nums",
				})}
			>
				({discordUserId})
			</span>
		</p>
	)
}

function RemovePlayerButton({ id }: { id: Id<"players"> }) {
	const { sessionId } = useRequiredAdminUser()
	const remove = useAsyncCallback(useMutation(api.players.remove))
	return remove.loading ? (
		<p>Removing...</p>
	) : (
		<button
			type="button"
			className={button()}
			onClick={() => remove({ id, sessionId })}
		>
			<LucideX /> Remove
		</button>
	)
}
