import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Form } from "@remix-run/react"
import { LogOut, User } from "lucide-react"
import { route } from "routes-gen"
import type { AuthContextUser } from "../app/auth"

export type UserMenuButtonProps = {
  user: AuthContextUser
}

export function UserMenuButton({ user }: UserMenuButtonProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="block" title="Account actions">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="rounded-full object-cover s-8"
          />
        ) : (
          <User />
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="panel origin-[var(--radix-dropdown-menu-content-transform-origin)] animate-from-opacity-0 animate-to-opacity-100 animate-from-scale-95 animate-to-scale-100 data-[state=open]:animate-in data-[state=closed]:animate-out"
          align="end"
          sideOffset={16}
        >
          <Form
            method="post"
            action={route("/auth/logout")}
            reloadDocument
            className="contents"
          >
            <DropdownMenu.Item className="block p-3 transition data-[highlighted]:bg-black/25">
              <div className="flex items-center gap-2 leading-none">
                <LogOut /> Sign out
              </div>
            </DropdownMenu.Item>
          </Form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
