import { createBrowserRouter } from "react-router-dom"
import { AppLayout } from "./components/AppLayout"

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <h1>Home</h1>,
      },
    ],
  },
])
