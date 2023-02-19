import { Form } from "@remix-run/react"
import { Menu, MenuButton, MenuItem, useMenuState } from "ariakit"
import { LogOut, User } from "lucide-react"
import { route } from "routes-gen"
import type { AuthContextUser } from "../app/auth"
import { menuItemClass, menuPanelClass } from "../ui/styles"

export type UserMenuButtonProps = {
  user: AuthContextUser
}

export function UserMenuButton({ user }: UserMenuButtonProps) {
  const menu = useMenuState({
    gutter: 8,
    placement: "bottom-end",
    animated: true,
  })
  return (
    <>
      <MenuButton state={menu} className="block" title="Account actions">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="rounded-full object-cover s-8"
          />
        ) : (
          <User />
        )}
      </MenuButton>
      <Menu state={menu} className={menuPanelClass} portal>
        <Form
          method="post"
          action={route("/auth/logout")}
          reloadDocument
          className="contents"
        >
          <MenuItem as="button" type="submit" className={menuItemClass}>
            <div className="flex items-center gap-2 leading-none">
              <LogOut /> Sign out
            </div>
          </MenuItem>
        </Form>
      </Menu>
    </>
  )
}
