export class SpriteSheet {
  constructor({ image, frameWidth, frameHeight }) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;

    this.columns = Math.floor(image.width / frameWidth);
    this.rows = Math.floor(image.height / frameHeight);
  }

  getFrameRect(frameIndex) {
    const col = frameIndex % this.columns;
    const row = Math.floor(frameIndex / this.columns);

    return {
      sx: col * this.frameWidth,
      sy: row * this.frameHeight,
      sw: this.frameWidth,
      sh: this.frameHeight,
    };
  }
}