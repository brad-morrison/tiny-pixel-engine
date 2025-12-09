/**
 * main.js
 * ----------------------------------------------
 * Demo entrypoint for the Tiny Pixel Engine.
 *
 * Responsibilities:
 *   - Select canvas element
 *   - Initialize the Engine
 *   - Load hero assets (idle + walk animations)
 *   - Create the HeroScene and start the game loop
 *
 * This file intentionally stays minimal. All game
 * logic, asset loading, and animation behaviour is
 * delegated to dedicated modules.
 *
 * Acts as an example of how a real project might
 * bootstrap a new scene using the engine.
 * ----------------------------------------------
 */

import { Engine } from "../../src/index.js";
import { createHero } from "./heroAssets.js";
import { HeroScene } from "./HeroScene.js";

const canvas = document.querySelector("#game");

// wrap in an async IIFE so we can await asset loading
(async function init() {
  const { hero, animations } = await createHero();

  const engine = new Engine({
    canvas,
    width: 160,
    height: 144,
    background: "#222",
  });

  const scene = new HeroScene(hero, animations);

  engine.addScene("hero", scene);
  engine.setScene("hero");
  engine.start();
})();