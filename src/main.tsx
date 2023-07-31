import "@fontsource-variable/spline-sans"
import { ConvexProvider } from "convex/react"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { convexClient } from "./convex"
import { router } from "./router"

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ConvexProvider client={convexClient}>
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    </ConvexProvider>
  </ErrorBoundary>,
)
