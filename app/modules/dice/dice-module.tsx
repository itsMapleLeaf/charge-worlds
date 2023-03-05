import { Dices } from "lucide-react"
import { DashboardModule } from "../dashboard/dashboard-module"
import { DicePanel } from "./dice-panel"

export const diceModule = new DashboardModule({
  name: "Dice",
  description: "Roll some dice!",
  icon: <Dices />,
  component: DicePanel,
})
