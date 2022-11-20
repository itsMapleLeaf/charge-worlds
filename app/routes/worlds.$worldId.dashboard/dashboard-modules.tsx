import { Clock, Dices, Users } from "lucide-react"
import { satisfies } from "../../helpers/satisfies"
import { CharactersModule } from "../worlds.$worldId.characters"
import { ClocksManager } from "../worlds.$worldId.clocks"
import { DiceRollForm } from "../worlds.$worldId.dice"
import type { DiceRoll } from "../worlds.$worldId.dice/dice-roll-list"
import { DiceRollList } from "../worlds.$worldId.dice/dice-roll-list"
import type { DashboardModule } from "./dashboard"

export const dashboardModules = satisfies<Record<string, DashboardModule>>()({
  characters: {
    name: "Characters",
    description: "Manage your characters",
    icon: <Users />,
    component: CharactersModule,
  },
  clocks: {
    name: "Clocks",
    description:
      "Track the progress of world forces, and other progressful things",
    icon: <Clock />,
    component: ClocksManager,
  },
  dice: {
    name: "Dice",
    description: "Roll some dice!",
    icon: <Dices />,
    component: function DiceModule(props: {
      rolls: DiceRoll[]
      rollFormVisible: boolean
    }) {
      return (
        <div className="flex flex-col h-full">
          <section className="flex-1 min-h-0">
            <DiceRollList rolls={props.rolls} />
          </section>
          {props.rollFormVisible && (
            <div className="p-4">
              <DiceRollForm />
            </div>
          )}
        </div>
      )
    },
  },
})
