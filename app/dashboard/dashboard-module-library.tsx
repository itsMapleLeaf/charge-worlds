import type { DiceRoll } from "../dice/dice-roll-list"
import { DiceRollList } from "../dice/dice-roll-list"
import { satisfies } from "../helpers/satisfies"
import { CharactersModule } from "../routes/worlds.$worldId.characters"
import { ClocksManager } from "../routes/worlds.$worldId.clocks"
import { DiceRollForm } from "../routes/worlds.$worldId.dice"
import type { DashboardModule } from "./dashboard-module"

export const dashboardModuleLibrary = satisfies<
  Record<string, DashboardModule>
>()({
  characters: {
    name: "Characters",
    description: "Manage your characters",
    component: CharactersModule,
  },
  clocks: {
    name: "Clocks",
    description:
      "Track the progress of world forces, and other progressful things",
    component: ClocksManager,
  },
  dice: {
    name: "Dice",
    description: "Roll some dice!",
    component: (props: { rolls: DiceRoll[]; rollFormVisible: boolean }) => (
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
    ),
  },
})

export type DashboardModuleData = {
  [K in keyof typeof dashboardModuleLibrary]: Parameters<
    typeof dashboardModuleLibrary[K]["component"]
  >[0]
}
