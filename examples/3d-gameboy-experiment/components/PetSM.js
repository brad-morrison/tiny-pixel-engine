// examples/demo/components/PetSM.js
import { Component } from "../../../src/index.js";

export class PetSM extends Component {
  constructor(needs, anim, sleepThreshold = 0, wakeThreshold = 80) {
    super();
    this.needs = needs;
    this.anim = anim;

    this.sleepT = sleepThreshold;
    this.wakeT = wakeThreshold;

    this.state = "idle";
    this.requestState = null;
  }

  request(next) {
    this.requestState = next; // null | "sleep" | "music" | "eat"
  }

  canMove() {
    return this.state === "idle" || this.state === "walk";
  }

  setState(next) {
    if (this.state === next) return;
    this.state = next;

    this.needs.setSleeping(next === "sleep");
    this.needs.setListening(next === "music");

    if (next === "walk") return void this.anim?.setState("walk");
    if (next === "sleep") return void this.anim?.setState("sleep");
    if (next === "music") return void this.anim?.setState("listenToMusic");
    if (next === "eat") return void this.anim?.setState("eat");

    this.anim?.setState("idle");
  }

  setMoving(isMoving) {
    if (this.requestState) return;
    this.setState(isMoving ? "walk" : "idle");
  }

  update() {
    const e = this.needs.energy;

    if (this.requestState) {
      this.setState(this.requestState);
      return;
    }

    // auto-sleep disabled for now
    if (this.state === "idle" && e <= this.sleepT) {
      // this.setState("sleep");
      return;
    }

    if (this.state === "sleep" && e >= this.wakeT) {
      this.setState("idle");
      return;
    }

    if (this.state === "music" || this.state === "eat") {
      this.setState("idle");
    }
  }
}