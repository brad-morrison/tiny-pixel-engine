// examples/demo/components/PlayerController.js
import { Component, Keyboard } from "../../../src/index.js";

export class PlayerController extends Component {
  constructor(animationController, { speed = 40 } = {}, stateMachine = null) {
    super();
    this.anim = animationController;
    this.stateMachine = stateMachine;
    this.keyboard = new Keyboard();
    this.speed = speed;
    this.currentState = "idle";
  }

  update(dt, scene) {
    const e = this.entity;
    const seconds = dt / 1000;

    // If pet is sleeping, don't allow movement or animation changes
    if (this.stateMachine && this.stateMachine.isAsleep()) {
      return;
    }

    let vx = 0;
    let vy = 0;

    // -------------------------
    // Movement keys
    // -------------------------
    const left  = this.keyboard.isDown("ArrowLeft")  || this.keyboard.isDown("a");
    const right = this.keyboard.isDown("ArrowRight") || this.keyboard.isDown("d");
    const up    = this.keyboard.isDown("ArrowUp")    || this.keyboard.isDown("w");
    const down  = this.keyboard.isDown("ArrowDown")  || this.keyboard.isDown("s");

    if (left) {
      vx = -this.speed;
      e.facing = -1;
    } 
    if (right) {
      vx = this.speed;
      e.facing = 1;
    }

    if (up) vy = -this.speed;
    if (down) vy = this.speed;

    // Apply movement
    e.x += vx * seconds;
    e.y += vy * seconds;

    // -------------------------
    // Special animation keys
    // -------------------------
    if (this.keyboard.isDown("m")) {
      return this.setAnimState("listenToMusic");
    }

    if (this.keyboard.isDown("n")) {
      return this.setAnimState("sleep");
    }

    // -------------------------
    // Walk / Idle
    // -------------------------
    if (vx !== 0 || vy !== 0) {
      return this.setAnimState("walk");
    }

    this.setAnimState("idle");
  }

  setAnimState(state) {
    if (state === this.currentState) return;
    this.currentState = state;
    this.anim.setState(state);
  }
}