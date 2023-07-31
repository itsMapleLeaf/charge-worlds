import "@fontsource-variable/spline-sans"
import { TooltipProvider } from "@radix-ui/react-tooltip"
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
      <TooltipProvider>
        <StrictMode>
          <RouterProvider router={router} />
        </StrictMode>
      </TooltipProvider>
    </ConvexProvider>
  </ErrorBoundary>,
)
