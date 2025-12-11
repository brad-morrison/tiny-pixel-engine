// examples/demo/gameobjects/PineTreePrefab.js
import { GameObject, Sprite } from "../../../src/index.js";
import { SpriteRenderer } from "../../../src/components/SpriteRenderer.js";
import { AssetRegistry } from "../AssetRegistry.js";

/**
 * PineTreePrefab
 * ----------------------------------
 * Builds a static pine tree GameObject:
 *  - Uses a single Sprite (no animation)
 *  - Renders via SpriteRenderer
 *  - Does not move or have behaviour
 */
export const PineTreePrefab = {
  instantiate({ x = 0, y = 0 } = {}) {
    const tree = new GameObject({
      name: "PineTree",
      x,
      y,
    });

    // Get the image from AssetRegistry
    const { image } = AssetRegistry.get("pineTree");

    // Adjust these to your sprite's actual pixel size
    const sprite = new Sprite({
      image,
      width: image.width,   // e.g. 16 or 32
      height: image.height, // e.g. 32
      sx: 0,
      sy: 0,
    });

    tree.addComponent(
      new SpriteRenderer({
        sprite,
      })
    );

    return tree;
  },
};