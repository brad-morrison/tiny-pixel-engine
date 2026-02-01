// src/components/TextLabel.js
import { Component } from "../Component.js";

/**
 * TextLabel
 * ----------------------------------
 * Renders simple pixel-style text.
 *
 * Attach to any GameObject:
 *   - world object (will be affected by camera + zoom)
 *   - UI object (added via scene.addUIObject, no camera)
 *
 * Example:
 *   const labelObject = new GameObject({ x: 10, y: 10 });
 *   labelObject.addComponent(
 *     new TextLabel({ text: "Hi!", fontSize: 8 })
 *   );
 *   scene.addUIObject(labelObject);
 */
export class TextLabel extends Component {
  constructor({
    text = "",
    offsetX = 0,
    offsetY = 0,
    fontSize = 8,      // in virtual pixels
    color = "#ffffff",
    align = "left",    // "left" | "center" | "right"
  } = {}) {
    super();
    this.text = text;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.fontSize = fontSize;
    this.color = color;
    this.align = align;
  }

  setText(newText) {
    this.text = newText;
  }

  draw(ctx, scale) {
    if (!this.text) return;

    const e = this.entity;

    // We treat e.x/e.y as the GameObject origin (like sprites).
    // offsetX/offsetY move the text relative to that origin.
    const x = (e.x + this.offsetX) * scale;
    const y = (e.y + this.offsetY) * scale;

    ctx.save();

    // Keep text sharp
    ctx.imageSmoothingEnabled = false;

    ctx.font = `${this.fontSize * scale}px monospace`;
    ctx.fillStyle = this.color;
    ctx.textAlign = this.align;
    ctx.textBaseline = "top";

    ctx.fillText(this.text, x, y);

    ctx.restore();
  }
}