// examples/demo/factories/makeTree.js
import { GameObject, Sprite, SpriteRenderer } from "../../../src/index.js";
import { getAsset } from "../assets.js";

export const makeTree = ({ x = 0, y = 0 } = {}) => {
  const { image } = getAsset("pineTree");

  const tree = new GameObject({
    name: "PineTree",
    x,
    y,
    originX: image.width / 2,
    originY: image.height,
  });

  tree.addComponent(
    new SpriteRenderer({
      sprite: new Sprite({
        image,
        width: image.width,
        height: image.height,
        sx: 0,
        sy: 0,
      }),
    })
  );

  return tree;
};