// examples/demo/components/PetStatusUI.js
import { Component, Sprite } from "../../../src/index.js";
import { AssetRegistry } from "../AssetRegistry.js";

/**
 * PetStatusUI
 * ----------------------------------
 * Draws simple status bars for:
 *  - hunger
 *  - energy
 *  - boredom
 *
 * This should be attached to a UI GameObject
 * that is added via scene.addUIObject(...)
 */
export class PetStatusUI extends Component {
    constructor(petNeeds, {
    x = 4,
    y = 4,
    } = {}) {
    super();
    this.needs = petNeeds;
    this.x = x;
    this.y = y;

    // Get UI images from registry
    const { frameImage, blockImage, hungerIconImage, energyIconImage, funIconImage } = AssetRegistry.get("petStatusUi");

    // Sprites for frame and block
    this.frameSprite = new Sprite({
        image: frameImage,
        width: frameImage.width,
        height: frameImage.height,
        sx: 0,
        sy: 0,
    });

    this.blockSprite = new Sprite({
        image: blockImage,
        width: blockImage.width,
        height: blockImage.height,
        sx: 0,
        sy: 0,
    });

    this.hungerIconSprite = new Sprite({
        image: hungerIconImage,
        width: hungerIconImage.width,
        height: hungerIconImage.height,
        sx: 0,
        sy: 0,
    });

    this.energyIconSprite = new Sprite({
        image: energyIconImage,
        width: energyIconImage.width,
        height: energyIconImage.height,
        sx: 0,
        sy: 0,
    });

    this.funIconSprite = new Sprite({
        image: funIconImage,
        width: funIconImage.width,
        height: funIconImage.height,
        sx: 0,
        sy: 0,
    });
    } // constructor

  draw(ctx, scale) {
    if (!this.needs) return;

    const baseX = this.x;
    const baseY = this.y;

    const frameWidth = 28;    // in pixels
    const frameHeight = this.frameSprite.height;  // in pixels
    const blockWidth = 4;    // e.g. 3px
    const blockHeight = this.blockSprite.height;

    const maxBlocks = Math.floor(frameWidth / blockWidth); // should be 9
    console.log("maxBlocks:", maxBlocks);
    const rowSpacing = frameHeight + 4;

    ctx.save();
    //ctx.font = `${5 * scale}px monospace`;
    //ctx.fillStyle = "#fff";

    const drawBar = (label, value, rowIndex) => {
    const y = baseY + rowIndex * rowSpacing;

    // Select icon
    let iconSprite;
    if (label === "Hunger") iconSprite = this.hungerIconSprite;
    else if (label === "Energy") iconSprite = this.energyIconSprite;
    else if (label === "Boredom") iconSprite = this.funIconSprite;

    // Icon (vertically centered to frame)
    if (iconSprite) {
      const ICON_GAP = 2;
      const iconX = baseX - iconSprite.width - ICON_GAP;
      const iconY = y + Math.floor(
        (frameHeight - iconSprite.height) / 2
      );

      iconSprite.draw(ctx, scale, iconX, iconY);
    }

    // Frame
    this.frameSprite.draw(ctx, scale, baseX, y);

    // Blocks
    const ratio = Math.max(0, Math.min(1, value / 100));
    const filledBlocks = Math.round(maxBlocks * ratio);

    const innerOffsetX = 2;
    const innerOffsetY = 1;

    for (let i = 0; i < filledBlocks; i++) {
      const blockX = baseX + innerOffsetX + i * blockWidth;
      const blockY = y + innerOffsetY;

      this.blockSprite.draw(ctx, scale, blockX, blockY);
    }
  };

  drawBar("Hunger", this.needs.hunger, 0);
  drawBar("Energy", this.needs.energy, 1);
  drawBar("Boredom", this.needs.boredom, 2);

  ctx.restore();
}
}