import { api } from "convex/_generated/api"
import { useMutation } from "convex/react"
import { LucideCheckCircle } from "lucide-react"
import { Suspense } from "react"
import { css } from "styled-system/css"
import { flex, hstack } from "styled-system/patterns"
import { zfd } from "zod-form-data"
import { Field } from "~/components/Field"
import { Spinner } from "~/components/Spinner"
import { useQuerySuspense } from "~/convex"
import { useFormSubmit } from "~/helpers/useFormSubmit"
import { button } from "~/styles/button"
import { input } from "~/styles/input"
import { settingsPageMainHeading } from "~/styles/settings"
import { useRequiredAdminUser } from "~/user/useRequiredAdminUser"

export function GeneralSettings() {
	return (
		<main className={css({ flex: 1 })}>
			<h2 className={settingsPageMainHeading}>General Settings</h2>
			<Suspense fallback={<Spinner size={8} />}>
				<GeneralSettingsForm />
			</Suspense>
		</main>
	)
}

function GeneralSettingsForm() {
	const { sessionId } = useRequiredAdminUser()
	const world = useQuerySuspense(api.worlds.get)
	const updateWorld = useMutation(api.worlds.update)

	const handleSubmit = useFormSubmit({
		schema: zfd.formData({ name: zfd.text() }),
		onSubmit: (data) => updateWorld({ ...data, sessionId }),
	})

	return (
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
					<LucideCheckCircle /> {handleSubmit.loading ? "Saving..." : "Save"}
				</button>
			</div>
		</form>
	)
}
