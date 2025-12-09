/**
 * HeroController.js
 * ------------------------------------------------
 * Encapsulates all logic for controlling the hero:
 *
 *   • Reads keyboard input
 *   • Sets hero velocity and facing direction
 *   • Chooses the current animation state
 *   • Updates the hero entity each frame
 *
 * This keeps input and movement behaviour separate
 * from the scene and makes it easy to reuse the same
 * hero behaviour in other scenes or projects.
 * ------------------------------------------------
 */

import { Keyboard, globalEventBus } from "../../src/index.js";

export class HeroController {
  constructor(hero, heroAnimations) {
    this.hero = hero;
    this.heroAnimations = heroAnimations;
    this.keyboard = new Keyboard();

    // Movement settings
    this.speed = 40; // virtual pixels per second

    // track animation state for events
    this.currentState = "idle";
  }

  update(dt) {
    // Reset velocity each frame
    this.hero.vx = 0;
    this.hero.vy = 0;

    // ---- Input -> movement ----
    if (this.keyboard.isDown("ArrowLeft") || this.keyboard.isDown("a")) {
      this.hero.vx = -this.speed;
      this.hero.facing = -1;
    }

    if (this.keyboard.isDown("ArrowRight") || this.keyboard.isDown("d")) {
      this.hero.vx = this.speed;
      this.hero.facing = 1;
    }
    
    // ---- Movement -> animation state ----
    let state = "idle";

    if (this.hero.vx !== 0 || this.hero.vy !== 0) {
    state = "walk";
    } else if (this.keyboard.isDown("m")) {
    state = "listenToMusic";
    } else if (this.keyboard.isDown("s")) {
    state = "sleep";
    }

    // Emit events on state change
    if (state !== this.currentState) {
      globalEventBus.emit("hero:state-changed", {
        prev: this.currentState,
        next: state,
      });
      this.currentState = state;
    }

    this.heroAnimations.setState(state);
    this.hero.update(dt);
  }

  draw(ctx, scale) {
    this.hero.draw(ctx, scale);
  }
}