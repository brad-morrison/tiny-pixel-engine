// examples/demo/components/PetStateMachine.js
import { Component } from "../../../src/index.js";

/**
 * PetStateMachine
 * ----------------------------------
 * Manages pet behavioral states based on needs:
 *  - 'awake': Normal state, pet is active
 *  - 'sleeping': Pet is tired and recovering energy
 *
 * State transitions:
 *  - awake → sleeping: when energy reaches 0
 *  - sleeping → awake: when energy reaches 50%
 */
export class PetStateMachine extends Component {
  constructor({
    petNeeds,
    animationController,
    sleepEnergyThreshold,
    wakeEnergyThreshold,
  } = {}) {
    super();
    this.petNeeds = petNeeds;
    this.anim = animationController;
    this.sleepEnergyThreshold = sleepEnergyThreshold;
    this.wakeEnergyThreshold = wakeEnergyThreshold;
    
    this.state = "awake";
    this.previousState = null;
  }

  update(dt) {
    const energy = this.petNeeds.energy;

    // Transition to sleeping
    if (this.state === "awake" && energy <= this.sleepEnergyThreshold) {
      this.setState("sleeping");
      // Increase energy recovery rate when sleeping
      this.petNeeds.energyRate = 5; // sleeps to recover faster
    }

    // Transition back to awake
    if (this.state === "sleeping" && energy >= this.wakeEnergyThreshold) {
      this.setState("awake");
      // Return to normal energy drain
      this.petNeeds.energyRate = -10;
    }
  }

  setState(newState) {
    if (newState === this.state) return;

    this.previousState = this.state;
    this.state = newState;
    // Update animation based on state
    if (newState === "sleeping") {
      this.anim.setState("sleep");
    } else if (newState === "awake") {
      // Return to idle when waking up
      this.anim.setState("idle");
    }
  }

  getState() {
    return this.state;
  }

  isAsleep() {
    return this.state === "sleeping";
  }

  isAwake() {
    return this.state === "awake";
  }
}
