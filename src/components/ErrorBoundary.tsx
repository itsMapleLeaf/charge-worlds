import {
	FallbackProps,
	ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary"

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
	return (
		<ReactErrorBoundary FallbackComponent={Fallback}>
			{children}
		</ReactErrorBoundary>
	)
}

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
	const message =
		error instanceof Error ? error.stack || error.message : String(error)
	return (
		<>
			<h1>Oops! Something went wrong.</h1>
			<pre>{message}</pre>
			<button onClick={() => resetErrorBoundary()}>Return to safety</button>
		</>
	)
}
