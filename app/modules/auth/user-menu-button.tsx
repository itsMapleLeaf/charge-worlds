import { Form } from "@remix-run/react"
import { LogOut, User } from "lucide-react"
import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components"
import { route } from "routes-gen"
import { useMountTransition } from "~/helpers/use-mount-transition"
import type { AuthContextUser } from "../app/auth"

export type UserMenuButtonProps = {
  user: AuthContextUser
}

export function UserMenuButton({ user }: UserMenuButtonProps) {
  const { isMounted, handleToggle, isTransitionVisible, elementRef } =
    useMountTransition()

  return (
    <DialogTrigger isOpen={isMounted} onOpenChange={handleToggle}>
      <Button className="block rounded-full focus-visible:ring-0 !data-[focus-visible]:ring-2">
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
        data-visible={isTransitionVisible || undefined}
        className="origin-top-right scale-95 opacity-0 transition data-[visible]:scale-100 data-[visible]:opacity-100"
        placement="bottom end"
        ref={elementRef}
      >
        <Dialog className="origin-top-right panel focus:ring-0 !data-[focus-visible]:ring-2">
          <Form
            method="POST"
            action={route("/auth/logout")}
            reloadDocument
            className="contents"
          >
            <Button className="flex items-center gap-2 p-3 leading-none transition data-[hovered]:text-accent-300 data-[pressed]:text-accent-100 data-[pressed]:duration-0">
              <LogOut /> Sign out
            </Button>
          </Form>
        </Dialog>
      </Popover>
    </DialogTrigger>
  )
}
