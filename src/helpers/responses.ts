import type { TypedResponse } from "@remix-run/node"

export function notFound(statusText?: string) {
  return new Response(undefined, {
    status: 404,
    statusText,
  }) as TypedResponse<never>
}

export function unauthorized(statusText?: string) {
  return new Response(undefined, {
    status: 401,
    statusText,
  }) as TypedResponse<never>
}

export function forbidden(statusText?: string) {
  return new Response(undefined, {
    status: 403,
    statusText,
  }) as TypedResponse<never>
}

export function badRequest(statusText?: string) {
  return new Response(undefined, {
    status: 400,
    statusText,
  }) as TypedResponse<never>
}

export function internalError(statusText?: string) {
  return new Response(undefined, {
    status: 500,
    statusText,
  }) as TypedResponse<never>
}
