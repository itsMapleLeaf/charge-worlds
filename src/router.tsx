import { createBrowserRouter } from "react-router-dom"
import { AppLayout } from "./components/AppLayout"
import { AuthCallback } from "./routes/AuthCallback"
import { CharacterFieldsSettings } from "./routes/CharacterFieldSettings/route"
import { Dashboard } from "./routes/Dashboard/route"
import { GeneralSettings } from "./routes/GeneralSettings/route"
import { PlayerSettings } from "./routes/PlayerSettings/route"
import { SettingsLayout } from "./routes/SettingsLayout/route"

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
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
