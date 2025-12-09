/**
 * HudOverlay.js
 * ------------------------------------------------
 * Simple HUD overlay that listens for hero state
 * changes via the globalEventBus and renders the
 * current hero state at the top-left of the canvas.
 *
 * This is purely for debugging / demo purposes to
 * prove that the event system is working.
 * ------------------------------------------------
 */

import { globalEventBus } from "../../src/index.js";

export class HudOverlay {
  constructor() {
    this.currentState = "idle";

    this.handleStateChange = this.handleStateChange.bind(this);
    globalEventBus.on("hero:state-changed", this.handleStateChange);
  }

  handleStateChange({ prev, next }) {
    this.currentState = next;
    // Optional debug:
    // console.log("HUD: hero state", prev, "→", next);
  }

  draw(ctx, scale) {
    const text = `STATE: ${this.currentState}`;

    ctx.save();

    // Simple semi-transparent box in the top-left
    const padding = 2 * scale;
    const boxWidth = 80 * scale;
    const boxHeight = 14 * scale;

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#000";
    ctx.fillRect(padding, padding, boxWidth, boxHeight);
    ctx.globalAlpha = 1;

    // Text – not pixel-perfect, but fine for HUD/debug
    ctx.fillStyle = "#fff";
    ctx.font = `${8 * scale}px monospace`;
    ctx.textBaseline = "top";
    ctx.fillText(text, padding + 2 * scale, padding + 2 * scale);

    ctx.restore();
  }

  destroy() {
    globalEventBus.off("hero:state-changed", this.handleStateChange);
  }
}