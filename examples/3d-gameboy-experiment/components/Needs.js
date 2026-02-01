// examples/demo/components/Needs.js
import { Component } from "../../../src/index.js";

export class Needs extends Component {
  constructor({
    maxBlocks = 10,

    hungerLoseEverySec = 5,
    energyLoseEverySec = 5,
    happinessLoseEverySec = 5,

    energyGainEverySecWhileSleeping = 1,
    happinessGainEverySecWhileMusic = 1,
  } = {}) {
    super();

    this.maxBlocks = maxBlocks;

    this.hunger = maxBlocks;
    this.energy = maxBlocks;
    this.happiness = maxBlocks;

    this.isSleeping = false;
    this.isListening = false;

    this.hungerLoseEverySec = hungerLoseEverySec;
    this.energyLoseEverySec = energyLoseEverySec;
    this.happinessLoseEverySec = happinessLoseEverySec;

    this.energyGainEverySecWhileSleeping = energyGainEverySecWhileSleeping;
    this.happinessGainEverySecWhileMusic = happinessGainEverySecWhileMusic;

    this._hungerLoseT = 0;
    this._energyLoseT = 0;
    this._happinessLoseT = 0;

    this._energyGainT = 0;
    this._happinessGainT = 0;
  }

  clampBlocks(v) {
    return Math.max(0, Math.min(this.maxBlocks, v));
  }

  setSleeping(on) {
    this.isSleeping = !!on;
    if (!on) this._energyGainT = 0;
  }

  setListening(on) {
    this.isListening = !!on;
    if (!on) this._happinessGainT = 0;
  }

  eat(blocks = 1) {
    this.hunger = this.clampBlocks(this.hunger + blocks);
  }

  loseBlock(which) {
    this[which] = this.clampBlocks(this[which] - 1);
  }

  gainBlock(which) {
    this[which] = this.clampBlocks(this[which] + 1);
  }

  update(dt) {
    const s = dt / 1000;

    this._hungerLoseT += s;
    while (this._hungerLoseT >= this.hungerLoseEverySec) {
      this._hungerLoseT -= this.hungerLoseEverySec;
      this.loseBlock("hunger");
    }

    this._energyLoseT += s;
    while (this._energyLoseT >= this.energyLoseEverySec) {
      this._energyLoseT -= this.energyLoseEverySec;
      this.loseBlock("energy");
    }

    this._happinessLoseT += s;
    while (this._happinessLoseT >= this.happinessLoseEverySec) {
      this._happinessLoseT -= this.happinessLoseEverySec;
      this.loseBlock("happiness");
    }

    if (this.isSleeping) {
      this._energyGainT += s;
      while (this._energyGainT >= this.energyGainEverySecWhileSleeping) {
        this._energyGainT -= this.energyGainEverySecWhileSleeping;
        this.gainBlock("energy");
      }
    }

    if (this.isListening) {
      this._happinessGainT += s;
      while (this._happinessGainT >= this.happinessGainEverySecWhileMusic) {
        this._happinessGainT -= this.happinessGainEverySecWhileMusic;
        this.gainBlock("happiness");
      }
    }
  }
}