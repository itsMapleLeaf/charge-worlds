import clsx from "clsx"
import { Virtuoso } from "react-virtuoso"
import { WorldContext } from "~/components/world-context"
import type { DiceRoll } from "../data/dice-collections"

export function DiceRollList({ rolls }: { rolls: DiceRoll[] }) {
  return (
    <Virtuoso
      className="[transform:translateZ(0)]"
      data={rolls}
      itemContent={(index, roll) => (
        <div className={index === 0 ? "" : "border-t border-white/10"}>
          <DiceRollItem roll={roll} />
        </div>
      )}
      initialTopMostItemIndex={rolls.length - 1}
      followOutput="smooth"
    />
  )
}

function DiceRollItem({ roll }: { roll: DiceRoll }) {
  const { world } = WorldContext.useValue()
  const rolledBy = world.memberships.find((m) => m.user.id === roll.rolledBy)

  const poolResult =
    roll.resultType === "highest"
      ? Math.max(...roll.dice.map((d) => d.result))
      : Math.min(...roll.dice.map((d) => d.result))

  const poolResultColor =
    poolResult === 6
      ? "text-emerald-400 drop-shadow-[0_0_4px_theme(colors.emerald.400)]"
      : poolResult >= 4
      ? "text-amber-400 drop-shadow-[0_0_4px_theme(colors.amber.400)]"
      : "text-rose-400 drop-shadow-[0_0_4px_theme(colors.rose.400)]"

  return (
    <div className="grid gap-2 p-3">
      {roll.intent && <p className="leading-snug">{roll.intent}</p>}

      <ul className="flex flex-wrap gap-1">
        {[...roll.dice]
          .sort((a, b) => b.result - a.result)
          .map((die, index) => (
            <li
              key={index}
              className={clsx(
                "relative flex items-center justify-center",
                die.result === poolResult && poolResultColor,
              )}
            >
              <HexagonFilled className="h-8 w-8" />
              <span className="absolute translate-y-[1px] font-medium text-gray-800">
                {die.result}
              </span>
            </li>
          ))}
      </ul>

      <p className="text-sm text-gray-400">
        Rolled by{" "}
        {rolledBy?.user.name ?? <span className="opacity-75">(unknown)</span>}
        {roll.resultType === "lowest" && " (disadvantage)"}
      </p>
    </div>
  )
}

function HexagonFilled(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 1.1547C13.2376 0.440169 14.7624 0.440169 16 1.1547L25.8564 6.8453C27.094 7.55983 27.8564 8.88034 27.8564 10.3094V21.6906C27.8564 23.1197 27.094 24.4402 25.8564 25.1547L16 30.8453C14.7624 31.5598 13.2376 31.5598 12 30.8453L2.14359 25.1547C0.905989 24.4402 0.143594 23.1197 0.143594 21.6906V10.3094C0.143594 8.88034 0.905989 7.55983 2.14359 6.8453L12 1.1547Z"
        fill="currentColor"
      />
    </svg>
  )
}
