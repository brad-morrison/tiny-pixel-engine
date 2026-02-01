export class Keyboard {
  constructor(target = window) {
    this.target = target;
    this.keys = new Map();

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.target.addEventListener("keydown", this.handleKeyDown);
    this.target.addEventListener("keyup", this.handleKeyUp);
  }

  handleKeyDown(event) {
    this.keys.set(event.key, true);
  }

  handleKeyUp(event) {
    this.keys.set(event.key, false);
  }

  isDown(key) {
    return this.keys.get(key) === true;
  }

  destroy() {
    this.target.removeEventListener("keydown", this.handleKeyDown);
    this.target.removeEventListener("keyup", this.handleKeyUp);
    this.keys.clear();
  }
}