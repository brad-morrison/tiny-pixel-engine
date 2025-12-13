// examples/demo/components/PetNeeds.js
import { Component } from "../../../src/index.js";

/**
 * PetNeeds
 * ----------------------------------
 * Tracks simple needs over time:
 *  - hunger: 0 (not hungry) → 100 (very hungry)
 *  - energy: 0 (exhausted)   → 100 (full of energy)
 *  - boredom: 0 (happy)      → 100 (bored)
 */
export class PetNeeds extends Component {
  constructor({
    hunger = 20,
    energy = 80,
    boredom = 10,
  } = {}) {
    super();
    this.hunger = hunger;
    this.energy = energy;
    this.boredom = boredom;

    // change rates per second
    this.hungerRate = 2;   // gets hungrier
    this.energyRate = -10;  // slowly loses energy
    this.boredomRate = 1.5; // gets more bored
  }

  clamp(value) {
    return Math.max(0, Math.min(100, value));
  }

  update(dt) {
    const seconds = dt / 1000;

    this.hunger = this.clamp(this.hunger + this.hungerRate * seconds);
    this.energy = this.clamp(this.energy + this.energyRate * seconds);
    this.boredom = this.clamp(this.boredom + this.boredomRate * seconds);
  }
}