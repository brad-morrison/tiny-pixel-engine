/**
 * heroAssets.js
 * ----------------------------------------------
 * Responsible for loading all assets related to
 * the hero character and constructing:
 *
 *  - SpriteSheets (idle + walk)
 *  - SpriteAnimations (idle + walk)
 *  - AnimationController (manages animation states)
 *  - Entity instance for the hero
 *
 * This module abstracts away all animation setup
 * so the main demo remains clean and focused on
 * engine bootstrapping.
 *
 * Export:
 *    createHero()  →  Promise<{ hero, animations }>
 * ----------------------------------------------
 */

import {
  SpriteSheet,
  SpriteAnimation,
  Entity,
  AnimationController,
  assetLoader,
} from "../../src/index.js";


// This function prepares everything related to the hero
export async function createHero() {
  const [
    idleImage,
    walkImage,
    musicImage,
    sleepImage,
  ] = await assetLoader.loadImages([
    "/examples/basic-demo/assets/idle_animation.png",
    "/examples/basic-demo/assets/walk_animation.png",
    "/examples/basic-demo/assets/music_animation.png",
    "/examples/basic-demo/assets/sleep_animation.png",
  ]);

  const frameWidth = 16;
  const frameHeight = 16;

  const idleSheet = new SpriteSheet({
    image: idleImage,
    frameWidth,
    frameHeight,
  });

  const walkSheet = new SpriteSheet({
    image: walkImage,
    frameWidth,
    frameHeight,
  });

  const musicSheet = new SpriteSheet({
    image: musicImage,
    frameWidth,
    frameHeight,
  });

  const sleepSheet = new SpriteSheet({
    image: sleepImage,
    frameWidth,
    frameHeight,
  });

  const idleAnim = new SpriteAnimation({
    spriteSheet: idleSheet,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameDuration: 140,
    loop: true,
  });

  const walkAnim = new SpriteAnimation({
    spriteSheet: walkSheet,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameDuration: 70,
    loop: true,
  });

  const musicAnim = new SpriteAnimation({
    spriteSheet: musicSheet,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameDuration: 180,
    loop: true,
  });

  const sleepAnim = new SpriteAnimation({
    spriteSheet: sleepSheet,
    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    frameDuration: 100,
    loop: true,
  });

  const heroAnimations = new AnimationController({
    animations: {
      idle: idleAnim,
      walk: walkAnim,
      listenToMusic: musicAnim,
        sleep: sleepAnim,
    },
    initialState: "idle",
  });

  const hero = new Entity({
    x: 20,
    y: 20,
    animation: heroAnimations,
    facing: 1,
  });

  return {
    hero,
    animations: heroAnimations,
  };
}