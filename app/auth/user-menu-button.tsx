import { Link } from "@remix-run/react"
import { Menu, MenuButton, MenuItem, useMenuState } from "ariakit"
import { LogOut, User } from "lucide-react"
import { route } from "routes-gen"
import { clearButtonClass, menuItemClass, menuPanelClass } from "../ui/styles"

export function UserMenuButton({
  user,
}: {
  user: { name: string; avatarUrl: string | null }
}) {
  const menu = useMenuState({
    gutter: 4,
    placement: "bottom-end",
    animated: true,
  })
  return (
    <>
      <MenuButton className={clearButtonClass} state={menu}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <User />
        )}
      </MenuButton>
      <Menu state={menu} className={menuPanelClass} portal>
        <MenuItem
          as={Link}
          to={route("/auth/logout")}
          className={menuItemClass}
        >
          <div className="flex gap-2 items-center leading-none">
            <LogOut /> Sign out
          </div>
        </MenuItem>
      </Menu>
    </>
  )
}
