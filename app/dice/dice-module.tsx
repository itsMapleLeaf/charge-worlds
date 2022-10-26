import clsx from "clsx"
import cuid from "cuid"
import { Virtuoso } from "react-virtuoso"
import { z } from "zod"
import { defineModule } from "../dashboard/dashboard-module"
import { DiceRollForm } from "./dice-roll-form"
import type { DiceRoll } from "./dice-roll-schema"
import { diceRollSchema } from "./dice-roll-schema"

export const diceModule = defineModule({
  name: "Dice",
  description: "Roll some dice!",

  stateSchema: z.object({ rolls: z.array(diceRollSchema) }),
  initialState: { rolls: [] },

  eventSchema: z.object({
    type: z.literal("roll"),
    intent: z.string(),
    poolSize: z.number(),
    rolledBy: z.string(),
  }),
  onEvent: async ({ event, updateState }) => {
    if (event.type === "roll") {
      // eslint-disable-next-line unicorn/prefer-node-protocol
      const crypto = await import("crypto")
      updateState((state) => {
        state.rolls.push({
          id: cuid(),
          intent: event.intent,
          rolledBy: event.rolledBy,
          resultType: event.poolSize <= 0 ? "lowest" : "highest",
          dice: Array.from(
            { length: event.poolSize <= 0 ? 2 : event.poolSize },
            () => ({
              sides: 6,
              result: crypto.randomInt(1, 7),
            }),
          ),
        })
      })
    }
  },

  render: ({ state: { rolls }, send }, user: { name: string } | undefined) => (
    <div className="h-full flex flex-col">
      <DiceRollList rolls={rolls} />
      {user && (
        <div className="p-4">
          <DiceRollForm
            onSubmit={(intent, poolSize) => {
              send({ type: "roll", intent, poolSize, rolledBy: user.name })
            }}
          />
        </div>
      )}
    </div>
  ),
})

function DiceRollList({ rolls }: { rolls: DiceRoll[] }) {
  return (
    <div className="h-full">
      <Virtuoso
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className="thin-scrollbar"
        data={rolls}
        itemContent={(index, roll) => (
          <div className="pt-4 px-4">
            <DiceRollItem roll={roll} />
          </div>
        )}
        initialTopMostItemIndex={rolls.length - 1}
        followOutput="smooth"
      />
    </div>
  )
}

function DiceRollItem({ roll }: { roll: DiceRoll }) {
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
    <div className="p-3 bg-black/25 rounded-md grid gap-2">
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
              <HexagonFilled className="w-8 h-8" />
              <span className="absolute translate-y-[1px] font-medium text-gray-800">
                {die.result}
              </span>
            </li>
          ))}
      </ul>

      <p className="text-gray-400 text-sm">
        Rolled by {roll.rolledBy}
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
