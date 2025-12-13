// examples/demo/components/PetStatusUI.js
// Converted: PetStatusUI is now a GameObject (`PetStatusBar`) rather than a Component.
import { GameObject } from "../../../src/GameObject.js";
import { Sprite } from "../../../src/Sprite.js";

/**
 * PetStatusBar
 * ----------------------------------
 * A small, screen-space GameObject that displays a single icon and a
 * compact status bar for a value (0-100). Designed to be added via
 * `scene.addUIObject(...)`.
 *
 * Usage:
 *   const bar = new PetStatusBar(iconImage, 75, { x: 10, y: 10 });
 *   scene.addUIObject(bar);
 */
export class PetStatusBar extends GameObject {
  constructor(iconImage, value = 100, {
    x = 4,
    y = 4,
    width = 28,      // total frame width in virtual pixels
    height = 8,      // frame height in virtual pixels
    blockWidth = 4,  // width of each filled block
    gap = 2,         // gap between icon and frame
    frameColor = "#444",
    blockColor = "#7af",
    emptyColor = "#222",
    border = true,
    frameImage = null,
    blockImage = null,
  } = {}) {
    super({ name: "PetStatusBar", x, y });
    this.iconSprite = iconImage ? new Sprite({ image: iconImage, width: iconImage.width, height: iconImage.height }) : null;
    this.value = value;

    this.width = width;
    this.height = height;
    this.blockWidth = blockWidth;
    this.gap = gap;

    this.frameColor = frameColor;
    this.blockColor = blockColor;
    this.emptyColor = emptyColor;
    this.border = border;

    // Optional sprites (use PNG assets if provided)
    this.frameSprite = frameImage ? new Sprite({ image: frameImage, width: frameImage.width, height: frameImage.height }) : null;
    this.blockSprite = blockImage ? new Sprite({ image: blockImage, width: blockImage.width, height: blockImage.height }) : null;
  }

  setValue(v) {
    this.value = Math.max(0, Math.min(100, v));
  }

  setIcon(image) {
    this.iconSprite = image ? new Sprite({ image, width: image.width, height: image.height }) : null;
  }

  draw(ctx, scale) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const e = this;
    const baseX = e.x;
    const baseY = e.y;

    // Draw icon (to left of frame) if present
    if (this.iconSprite) {
      const iconX = baseX - this.iconSprite.width - this.gap;
      const iconY = baseY + Math.floor((this.height - this.iconSprite.height) / 2);
      this.iconSprite.draw(ctx, scale, iconX, iconY);
    }

    // Frame background (use sprite if available)
    const frameX = baseX;
    const frameY = baseY;
    // If using a frame sprite, prefer its native size; otherwise use configured size
    const frameW = this.frameSprite ? this.frameSprite.width : this.width;
    const frameH = this.frameSprite ? this.frameSprite.height : this.height;

    if (this.frameSprite) {
      this.frameSprite.draw(ctx, scale, frameX - 1, frameY + 1);
    } else {
      ctx.fillStyle = this.emptyColor;
      ctx.fillRect(frameX * scale, frameY * scale, frameW * scale, frameH * scale);
    }

    // Filled blocks
    const blockWUsed = this.blockSprite ? this.blockSprite.width : this.blockWidth;
    const maxBlocks = Math.floor(frameW / blockWUsed);
    const ratio = Math.max(0, Math.min(1, this.value / 100));
    const filled = Math.round(maxBlocks * ratio);

    const innerOffsetX = 1;
    const innerOffsetY = 2;

    for (let i = 0; i < filled; i++) {
      const bx = frameX + innerOffsetX + i * blockWUsed;
      const by = frameY + innerOffsetY;
      this.blockSprite.draw(ctx, scale, bx, by);
    }

    ctx.restore();
  }
}