import { charactersModule } from "../characters/characters-module"
import { clocksModule } from "../clocks/clocks-module"
import { diceModule } from "../dice/dice-module"
import { galleryModule } from "../gallery/gallery-module"
import { sceneModule } from "../scene/scene-module"

export const dashboardModules = {
  scene: sceneModule,
  characters: charactersModule,
  clocks: clocksModule,
  dice: diceModule,
  gallery: galleryModule,
}
