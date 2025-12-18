// examples/demo/components/ClickToMove.js
import { Component } from "../../../src/index.js";

export class ClickToMove extends Component {
  constructor({
    speed = 30,
    sm = null,
    resumeWanderAfterMs = 5000,
    bounds = null,
    arriveEpsilon = 1,
  } = {}) {
    super();
    this.speed = speed;
    this.sm = sm;
    this.resumeAfter = resumeWanderAfterMs;
    this.bounds = bounds;
    this.arriveEpsilon = arriveEpsilon;

    this.active = false;
    this.targetX = 0;
    this.waitMs = 0;
  }

  setTarget(x) {
    this.targetX = Math.round(x);
    this.active = true;
    this.waitMs = 0;
  }

  clampToBounds(e) {
    if (!this.bounds) return;
    const { xMin, xMax } = this.bounds;
    if (typeof xMin === "number" && typeof xMax === "number") {
      e.x = Math.max(xMin, Math.min(xMax, e.x));
    }
  }

  update(dt) {
    if (this.sm && !this.sm.canMove()) {
      this.sm.setMoving(false);
      return;
    }
    if (!this.active) return;

    const e = this.entity;
    const s = dt / 1000;

    const dx = this.targetX - e.x;
    const dist = Math.abs(dx);

    if (dist <= this.arriveEpsilon) {
      this.sm?.setMoving(false);
      this.waitMs += dt;
      if (this.waitMs >= this.resumeAfter) {
        this.active = false;
        this.waitMs = 0;
      }
      return;
    }

    const dir = dx < 0 ? -1 : 1;
    e.facing = dir;

    const step = this.speed * s;
    e.x += dir * Math.min(step, dist);

    this.clampToBounds(e);
    this.sm?.setMoving(true);
  }
}