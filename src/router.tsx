import { Suspense } from "react"
import { createBrowserRouter } from "react-router-dom"
import { css } from "styled-system/css"
import { center } from "styled-system/patterns"
import { AppLayout } from "./components/AppLayout"
import { Spinner } from "./components/Spinner"
import { AppErrorBoundary } from "./errors/AppErrorBoundary"
import { AuthCallback } from "./routes/AuthCallback"
import { CharacterFieldsSettings } from "./routes/CharacterFieldSettings/route"
import { Dashboard } from "./routes/Dashboard/route"
import { GeneralSettings } from "./routes/GeneralSettings/route"
import { PlayerSettings } from "./routes/PlayerSettings/route"
import { SettingsLayout } from "./routes/SettingsLayout/route"

const fullScreenSpinner = (
	<div className={center({ h: "screen" })}>
		<Spinner size={12} className={css({ m: "auto" })} />
	</div>
)

export const router = createBrowserRouter([
	{
		element: (
			<AppErrorBoundary className={css({ p: 4 })}>
				<Suspense fallback={fullScreenSpinner}>
					<AppLayout />
				</Suspense>
			</AppErrorBoundary>
		),
		children: [
			{
				index: true,
				element: <Dashboard />,
			},
			{
				path: "settings",
				element: <SettingsLayout />,
				children: [
					{
						index: true,
						element: <GeneralSettings />,
					},
					{
						path: "players",
						element: <PlayerSettings />,
					},
					{
						path: "character-fields",
						element: <CharacterFieldsSettings />,
					},
				],
			},
		],
	},
	{
		path: "auth/callback",
		element: <AuthCallback />,
	},
])
