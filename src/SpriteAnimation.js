export class SpriteAnimation {
  constructor({ spriteSheet, frames, frameDuration = 120, loop = true }) {
    this.spriteSheet = spriteSheet; // SpriteSheet instance
    this.frames = frames;           // array of frame indices, e.g. [0,1,2,3]
    this.frameDuration = frameDuration; // ms per frame
    this.loop = loop;

    this.time = 0;
    this.currentFrameIndex = 0;
  }

  update(dt) {
    this.time += dt;

    const totalDuration = this.frameDuration * this.frames.length;

    if (!this.loop && this.time >= totalDuration) {
      // Clamp to last frame if not looping
      this.time = totalDuration - 1;
      this.currentFrameIndex = this.frames.length - 1;
      return;
    }

    const framePos = this.time % totalDuration;
    this.currentFrameIndex = Math.floor(framePos / this.frameDuration);
  }

    draw(ctx, scale, x, y, options = {}) {
    const { flipX = false } = options;

    const frameId = this.frames[this.currentFrameIndex];
    const rect = this.spriteSheet.getFrameRect(frameId);
    const image = this.spriteSheet.image;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (flipX) {
      // Flip around the sprite's left edge, so logical x,y stays the same.
      // We move the origin to (x + width, y), then scale X by -1.
      const destWidth = rect.sw * scale;
      const destHeight = rect.sh * scale;

      ctx.translate((x * scale) + destWidth, y * scale);
      ctx.scale(-1, 1);

      ctx.drawImage(
        image,
        rect.sx,
        rect.sy,
        rect.sw,
        rect.sh,
        0,
        0,
        destWidth,
        destHeight
      );
    } else {
      ctx.drawImage(
        image,
        rect.sx,
        rect.sy,
        rect.sw,
        rect.sh,
        x * scale,
        y * scale,
        rect.sw * scale,
        rect.sh * scale
      );
    }

    ctx.restore();
  }
}