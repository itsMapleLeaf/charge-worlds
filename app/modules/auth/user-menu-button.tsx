import { Form, Link } from "@remix-run/react"
import { LogOut, Settings, User } from "lucide-react"
import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components"
import { route } from "routes-gen"
import type { AuthContextUser } from "../app/auth"

export type UserMenuButtonProps = {
  user: AuthContextUser
}

export function UserMenuButton({ user }: UserMenuButtonProps) {
  return (
    <DialogTrigger>
      <Button className="block focus:ring-0 data-[focus-visible]:ring-2">
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
      </Button>
      <Popover
        className="animate-from-opacity-0 animate-from-scale-95 data-[entering]:animate-in data-[exiting]:animate-out"
        placement="bottom end"
      >
        <Dialog className="panel flex min-w-[12rem] origin-top-right flex-col focus:ring-0 data-[focus-visible]:ring-2">
          <Link
            to="/settings"
            className="flex items-center gap-2 p-3 leading-none transition hover:text-foreground-8 data-[highlighted]:bg-black/25"
          >
            <Settings /> Settings
          </Link>
          <Form
            method="POST"
            action={route("/auth/logout")}
            reloadDocument
            className="contents"
          >
            <button className="flex items-center gap-2 p-3 leading-none transition hover:text-foreground-8 data-[highlighted]:bg-black/25">
              <LogOut /> Sign out
            </button>
          </Form>
        </Dialog>
      </Popover>
    </DialogTrigger>
  )
}
