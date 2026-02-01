// examples/demo/factories/makeFridge.js
import {
  GameObject,
  SpriteSheet,
  SpriteAnimation,
  AnimationController,
  SpriteRenderer,
  PointerArea,
} from "../../../src/index.js";
import { getAsset } from "../assets.js";

export const makeFridge = ({ x = 0, y = 0 } = {}) => {
  const { image } = getAsset("fridgeAnim");

  const FRAME_W = 37;
  const FRAME_H = 30;

  const fridge = new GameObject({
    name: "Fridge",
    x,
    y,
    z: 1,
    originX: FRAME_W / 2,
    originY: FRAME_H,
  });

  const sheet = new SpriteSheet({ image, frameWidth: FRAME_W, frameHeight: FRAME_H });

  const anim = new AnimationController({
    animations: {
      closed: new SpriteAnimation({
        spriteSheet: sheet,
        frames: [0],
        frameDuration: 1000,
        loop: false,
      }),
      open: new SpriteAnimation({
        spriteSheet: sheet,
        frames: [0, 1, 2, 3, 4, 5],
        frameDuration: 80,
        loop: false,
      }),
      close: new SpriteAnimation({
        spriteSheet: sheet,
        frames: [5, 4, 3, 2, 1, 0],
        frameDuration: 40,
        loop: false,
      }),
    },
    initialState: "closed",
  });

  fridge.addComponent(new SpriteRenderer({ animation: anim }));

  let isOpen = false;

  fridge.addComponent(
    new PointerArea({
      width: FRAME_W,
      height: FRAME_H,
      onClick: () => {
        isOpen = !isOpen;
        anim.setState(isOpen ? "open" : "close");
      },
    })
  );

  return fridge;
};