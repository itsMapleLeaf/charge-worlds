import { ErrorBoundary, FallbackProps } from "react-error-boundary"
import { css, cx } from "styled-system/css"
import { toError } from "~/errors/helpers"
import { Merge } from "~/helpers/types"
import { button } from "~/styles/button"
import { AppError } from "./AppError"

export function AppErrorBoundary({
	children,
	...props
}: React.HTMLAttributes<HTMLElement>) {
	return (
		<ErrorBoundary
			fallbackRender={(fallbackProps) => (
				<Fallback {...props} {...fallbackProps} />
			)}
		>
			{children}
		</ErrorBoundary>
	)
}

function Fallback({
	error,
	resetErrorBoundary,
	...props
}: Merge<React.HTMLAttributes<HTMLElement>, FallbackProps>) {
	if (error instanceof AppError) {
		return (
			<p
				{...props}
				className={cx(css({ color: "error.300" }), props.className)}
			>
				Error: {error.message}
			</p>
		)
	}

	const { stack, message } = toError(error)
	return (
		<section {...props}>
			<h2 className={css({ fontSize: "3xl", fontWeight: "light" })}>
				Something went wrong.
			</h2>
			<pre className={css({ overflowX: "auto", fontFamily: "mono", mb: 4 })}>
				{stack || message}
			</pre>
			<p>
				<button className={button()} onClick={resetErrorBoundary}>
					Try again
				</button>
			</p>
		</section>
	)
}
