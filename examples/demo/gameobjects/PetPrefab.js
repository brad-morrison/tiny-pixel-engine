// examples/demo/gameobjects/PetPrefab.js
import {
  GameObject,
  SpriteSheet,
  SpriteAnimation,
  AnimationController,
} from "../../../src/index.js";
import { SpriteRenderer } from "../../../src/components/SpriteRenderer.js";
import { AssetRegistry } from "../AssetRegistry.js";

/**
 * PetPrefab
 * ----------------------------------
 * Builds a Pet GameObject with:
 *  - SpriteSheets for each state
 *  - SpriteAnimations (idle, walk, listenToMusic, sleep)
 *  - AnimationController
 *  - SpriteRenderer component
 *
 * Asset images are pulled from AssetRegistry under key "pet".
 */
export const PetPrefab = {
  instantiate({ x = 0, y = 0 } = {}) {
    const pet = new GameObject({
      name: "Pet",
      x,
      y,
      originX: 8, // center of 16x16
      originY: 8,
    });

    // Pull images from registry
    const { idleImg, walkImg, musicImg, sleepImg } = AssetRegistry.get("pet");

    // Helpers to keep this readable
    const makeSheet = (image) =>
      new SpriteSheet({
        image,
        frameWidth: 16,
        frameHeight: 16,
      });

    const makeAnim = (
      sheet,
      frameDuration = 120,
      frames = [0, 1, 2, 3, 4, 5, 6, 7]
    ) =>
      new SpriteAnimation({
        spriteSheet: sheet,
        frames,
        frameDuration,
        loop: true,
      });

    // SpriteSheets
    const idleSheet = makeSheet(idleImg);
    const walkSheet = makeSheet(walkImg);
    const musicSheet = makeSheet(musicImg);
    const sleepSheet = makeSheet(sleepImg);

    // Animations
    const idleAnim = makeAnim(idleSheet, 140);
    const walkAnim = makeAnim(walkSheet, 80);
    const musicAnim = makeAnim(musicSheet, 180);

    const sleepAnim = new SpriteAnimation({
      spriteSheet: sleepSheet,
      frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      frameDuration: 100,
      loop: true,
    });

    // AnimationController
    const petAnimations = new AnimationController({
      animations: {
        idle: idleAnim,
        walk: walkAnim,
        listenToMusic: musicAnim,
        sleep: sleepAnim,
      },
      initialState: "idle",
    });

    // Rendering
    pet.addComponent(
      new SpriteRenderer({
        animation: petAnimations,
      })
    );

    return {
      pet,
      animations: petAnimations,
      petAnimations, // alias for consistency
    };
  },
};