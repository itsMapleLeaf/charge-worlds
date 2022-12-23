import {
  Menu,
  MenuArrow,
  MenuButton,
  MenuSeparator,
  useMenuState,
} from "ariakit"
import { LogOut } from "lucide-react"

export function UserButton({
  user,
}: {
  user: { name: string; avatarUrl?: string }
}) {
  const menu = useMenuState({ gutter: 4, animated: true })
  return (
    <>
      <MenuButton
        state={menu}
        className="bg-black/75 opacity-70 transition-opacity hover:opacity-100"
        title="Account actions"
      >
        <img src={user.avatarUrl} className="rounded-full s-8" alt="" />
      </MenuButton>
      <Menu
        state={menu}
        className="flex w-36 flex-col rounded bg-white text-gray-900 shadow-md transition data-[enter]:translate-y-0 data-[leave]:translate-y-1 data-[enter]:opacity-100 data-[leave]:opacity-0"
      >
        <MenuArrow />
        <p className="p-2 leading-tight">
          <span className="text-xs leading-tight">Signed in as</span>
          <br />
          <span className="text-sm leading-tight">{user.name}</span>
        </p>
        <MenuSeparator className="h-px border-none bg-black/10" />
        <form method="post" action="/auth/logout" className="contents">
          <button className="flex items-center gap-2 p-2 text-left font-medium transition hover:bg-black/25">
            <LogOut className="s-5" /> Sign out
          </button>
        </form>
      </Menu>
    </>
  )
}
