export class Sprite {
  constructor(options) {
    const {
      image,      // HTMLImageElement
      width,      // sprite width in source pixels
      height,     // sprite height in source pixels
      sx = 0,     // source x in the image (for sprite sheets later)
      sy = 0      // source y
    } = options;

    this.image = image;
    this.width = width;
    this.height = height;
    this.sx = sx;
    this.sy = sy;
  }

  draw(ctx, scale, x, y) {
    // x, y are virtual coordinates
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      this.image,
      this.sx,
      this.sy,
      this.width,
      this.height,
      x * scale,
      y * scale,
      this.width * scale,
      this.height * scale
    );
  }
}