import * as Popover from "@radix-ui/react-popover"
import { Form, Link } from "@remix-run/react"
import { LogOut, Settings, User } from "lucide-react"
import { route } from "routes-gen"
import type { AuthContextUser } from "./auth-context"

export type UserMenuButtonProps = {
  user: AuthContextUser
}

export function UserMenuButton({ user }: UserMenuButtonProps) {
  return (
    <Popover.Root>
      <Popover.Trigger className="block rounded-full">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="rounded-full object-cover s-8"
          />
        ) : (
          <User />
        )}
        <span className="sr-only">User menu</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="radix-zoom-fade-transition panel glass flex min-w-[10rem] flex-col"
          align="end"
          sideOffset={8}
        >
          <Popover.Close asChild>
            <Link to="/settings" className="button button-clear ring-inset">
              <Settings /> Settings
            </Link>
          </Popover.Close>
          <Form
            method="POST"
            action={route("/auth/logout")}
            reloadDocument
            className="contents"
          >
            <Popover.Close
              className="button button-clear ring-inset"
              type="submit"
            >
              <LogOut /> Sign out
            </Popover.Close>
          </Form>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
