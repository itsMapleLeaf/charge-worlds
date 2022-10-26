import { charactersModule } from "../characters/characters-module"
import { clocksModule } from "../clocks/clocks-module"
import { diceModule } from "../dice/dice-module"
import { counterModule } from "./counter-module"
import type { DashboardModule } from "./dashboard-module"

export const dashboardModuleLibrary: Record<
  string,
  DashboardModule<any, any, [user: { name: string } | undefined]>
> = {
  characters: charactersModule,
  clocks: clocksModule,
  dice: diceModule,
  counter: counterModule,
}
