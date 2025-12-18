// examples/demo/factories/makePet.js
import {
  GameObject,
  SpriteSheet,
  SpriteAnimation,
  AnimationController,
  SpriteRenderer,
} from "../../../src/index.js";
import { getAsset } from "../assets.js";

const makeSheet = (image) => new SpriteSheet({ image, frameWidth: 16, frameHeight: 16 });

const makeLoop = (sheet, frameDuration = 120, frames = [0, 1, 2, 3, 4, 5, 6, 7]) =>
  new SpriteAnimation({ spriteSheet: sheet, frames, frameDuration, loop: true });

export const makePet = ({ x = 40, y = 40, z = 2 } = {}) => {
  const { idleImg, walkImg, musicImg, sleepImg, eatImg } = getAsset("pet");

  const pet = new GameObject({
    name: "Pet",
    x,
    y,
    z,
    originX: 8,
    originY: 8,
    originZ: 0,
  });

  const idle = makeLoop(makeSheet(idleImg), 140);
  const walk = makeLoop(makeSheet(walkImg), 80);
  const listenToMusic = makeLoop(makeSheet(musicImg), 180);

  const sleep = new SpriteAnimation({
    spriteSheet: makeSheet(sleepImg),
    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    frameDuration: 100,
    loop: true,
  });

  const eat =
    eatImg &&
    new SpriteAnimation({
      spriteSheet: makeSheet(eatImg),
      frames: Array.from({ length: Math.floor(eatImg.width / 16) }, (_, i) => i),
      frameDuration: 100,
      loop: false,
    });

  const anim = new AnimationController({
    animations: { idle, walk, listenToMusic, sleep, ...(eat ? { eat } : {}) },
    initialState: "idle",
  });

  pet.addComponent(new SpriteRenderer({ animation: anim }));
  return { pet, anim };
};