import { api } from "convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { LucideCheckCircle } from "lucide-react"
import { css } from "styled-system/css"
import { flex, hstack } from "styled-system/patterns"
import { zfd } from "zod-form-data"
import { Field } from "~/components/Field"
import { useFormSubmit } from "~/helpers/useFormSubmit"
import { button } from "~/styles/button"
import { input } from "~/styles/input"
import { settingsPageHeading } from "~/styles/settings"

export function GeneralSettings() {
	const world = useQuery(api.worlds.get)

	const handleSubmit = useFormSubmit({
		schema: zfd.formData({ name: zfd.text() }),
		onSubmit: useMutation(api.worlds.update),
	})

	return (
		<main className={css({ flex: 1 })}>
			<h2 className={settingsPageHeading}>General Settings</h2>
			{world ? (
				<form
					className={flex({ direction: "column", gap: 3 })}
					onSubmit={handleSubmit}
				>
					<Field label="Name" inputId="name">
						<input
							id="name"
							name="name"
							type="text"
							defaultValue={world?.name}
							className={input()}
						/>
					</Field>
					<div className={hstack({ gap: 4 })}>
						<button className={button()} disabled={handleSubmit.loading}>
							<LucideCheckCircle />{" "}
							{handleSubmit.loading ? "Saving..." : "Save"}
						</button>
					</div>
				</form>
			) : (
				<p>Loading...</p>
			)}
		</main>
	)
}
