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

  draw(ctx, scale, x, y) {
    const frameId = this.frames[this.currentFrameIndex];
    const rect = this.spriteSheet.getFrameRect(frameId);

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      this.spriteSheet.image,
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
}