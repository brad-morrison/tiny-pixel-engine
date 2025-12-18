// examples/demo/components/Actions.js
import { Component, Keyboard } from "../../../src/index.js";

const key = (keyboard, name) => keyboard.isDown(name);

export class Actions extends Component {
  constructor(anim, needs, sm) {
    super();
    this.anim = anim;
    this.needs = needs;
    this.sm = sm;

    this.keyboard = new Keyboard();

    this.isEating = false;
    this.timeLeft = 0;

    this.heldE = false;
    this.heldM = false;
    this.heldQ = false;
  }

  update(dt) {
    const downM = this.keyboard.isDown("m");
    if (downM && !this.heldM) {
      this.sm.request(this.sm.requestState === "music" ? null : "music");
    }
    this.heldM = downM;

    const downQ = this.keyboard.isDown("q");
    if (downQ && !this.heldQ) {
      this.sm.request(this.sm.requestState === "sleep" ? null : "sleep");
    }
    this.heldQ = downQ;

    if (this.sm.state === "sleep" || this.sm.state === "music") return;

    const downE = key(this.keyboard, "e");
    const hasEatAnim = !!this.anim?.animations?.eat;
    const canEat = !this.heldE && !this.isEating && hasEatAnim;

    if (downE && canEat) {
      const a = this.anim.animations.eat;
      const frames = a.frames?.length || 1;
      const len = frames * (a.frameDuration || 100);

      this.isEating = true;
      this.timeLeft = len;
      this.sm.request("eat");
    }
    this.heldE = downE;

    if (!this.isEating) return;

    this.timeLeft -= dt;
    if (this.timeLeft > 0) return;

    this.isEating = false;
    this.needs.eat(1);
    this.sm.request(null);
  }
}