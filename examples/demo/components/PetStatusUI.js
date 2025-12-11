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
    const { frameImage, blockImage } = AssetRegistry.get("petStatusUi");

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
    }

  draw(ctx, scale) {
    if (!this.needs) return;

    const baseX = this.x * scale;
    const baseY = this.y * scale;

    const frameWidth = this.frameSprite.width;    // in pixels
    const frameHeight = this.frameSprite.height;  // in pixels
    const blockWidth = this.blockSprite.width;    // e.g. 3px
    const blockHeight = this.blockSprite.height;

    const maxBlocks = Math.floor(frameWidth / blockWidth); // should be 9
    const rowSpacing = (frameHeight + 4) * scale; // space between bars

    ctx.save();
    ctx.font = `${6 * scale}px monospace`;
    ctx.fillStyle = "#fff";

    const drawBar = (label, value, rowIndex) => {
        const y = baseY + rowIndex * rowSpacing;

        // Label
        ctx.fillText(label, baseX, y - 2);

        // Frame
        this.frameSprite.draw(ctx, scale, baseX / scale, y / scale);

        // How many blocks are filled?
        const ratio = Math.max(0, Math.min(1, value / 100));
        const filledBlocks = Math.round(maxBlocks * ratio);

        const innerOffsetX = 1; // px inside the frame
        const innerOffsetY = 1; // px inside the frame

        for (let i = 0; i < filledBlocks; i++) {
        // Apply offsets AND block positions
        const blockX = (baseX + (innerOffsetX + i * blockWidth) * scale) / scale;
        const blockY = (y + innerOffsetY * scale) / scale;

        this.blockSprite.draw(ctx, scale, blockX, blockY);
        }
  };

  drawBar("Hunger", this.needs.hunger, 0);
  drawBar("Energy", this.needs.energy, 1);
  drawBar("Boredom", this.needs.boredom, 2);

  ctx.restore();
}
}