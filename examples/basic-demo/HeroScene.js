/**
 * HeroScene.js
 * ------------------------------------------------
 * Scene responsible for updating and rendering the
 * hero character.
 *
 * Delegates control logic to HeroController, so this
 * scene only needs to:
 *
 *   • Hold a reference to the controller
 *   • Call controller.update(dt) each frame
 *   • Call controller.draw(ctx, scale) to render
 *
 * This keeps the scene lightweight and focused on
 * composition rather than input or animation logic.
 * ------------------------------------------------
 */

import { Scene } from "../../src/index.js";
import { HeroController } from "./HeroController.js";

export class HeroScene extends Scene {
  constructor(hero, heroAnimations) {
    super();
    this.heroController = new HeroController(hero, heroAnimations);
  }

  update(dt) {
    this.heroController.update(dt);
  }

  draw(ctx, scale) {
    this.heroController.draw(ctx, scale);
  }
}