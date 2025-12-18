import {
  Engine,
  assetLoader,
  Scene,
  GameObject,
  SpriteSheet,
  SpriteAnimation,
  AnimationController,
  Keyboard,
  Sprite,
  SpriteRenderer,
  Component,
} from "../../src/index.js";

/* ============================================================================
 *  ASSET REGISTRY
 * ============================================================================
 */

const ASSETS = new Map();

const setAsset = (key, value) => ASSETS.set(key, value);

const getAsset = (key) => {
  if (!ASSETS.has(key)) throw new Error(`Missing asset: ${key}`);
  return ASSETS.get(key);
};

/* ============================================================================
 *  HELPERS
 * ============================================================================
 */

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const clamp100 = (v) => Math.max(0, Math.min(100, v));
const seconds = (dtMs) => dtMs / 1000;

const key = (keyboard, name) => keyboard.isDown(name);

const moveInput = (k) => {
  const left = key(k, "ArrowLeft") || key(k, "a");
  const right = key(k, "ArrowRight") || key(k, "d");
  const up = key(k, "ArrowUp") || key(k, "w");
  const down = key(k, "ArrowDown") || key(k, "s");

  return {
    x: (right ? 1 : 0) - (left ? 1 : 0),
    y: (down ? 0 : 0) - (up ? 0 : 0), // I have disabled vertical movement, to re-add - (down ? 1 : 0) - (up ? 1 : 0) 
  };
};

const normalize = (x, y) => {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
};

/* ============================================================================
 *  COMPONENTS
 * ============================================================================
 */

class Needs extends Component {
  constructor({ h = 20, e = 80, b = 10, hr = 2, er = -1, br = 1.5 } = {}) {
    super();
    this.hunger = h;
    this.energy = e;
    this.boredom = b;

    this.hungerRate = hr;
    this.energyRate = er;
    this.boredomRate = br;
  }

  feed(amount = 10) {
    this.hunger = clamp100(this.hunger - amount);
  }

  update(dt) {
    const s = seconds(dt);
    this.hunger = clamp100(this.hunger + this.hungerRate * s);
    this.energy = clamp100(this.energy + this.energyRate * s);
    this.boredom = clamp100(this.boredom + this.boredomRate * s);
  }
}

/**
 * PetSM = single source of truth for:
 * - current state
 * - animation selection
 * - stat rate tweaks while in a state
 *
 * States:
 * - idle (default)
 * - walk (set by Player while moving)
 * - sleep/music/eat (requested by Actions)
 */
class PetSM extends Component {
  constructor(needs, anim, sleepThreshold = 0, wakeThreshold = 80) {
    super();
    this.needs = needs;
    this.anim = anim;

    this.sleepT = sleepThreshold;
    this.wakeT = wakeThreshold;

    this.state = "idle"; // "idle" | "walk" | "sleep" | "music" | "eat"
    this.requestState = null; // null = no manual request
  }

  request(next) {
    // next: null | "sleep" | "music" | "eat"
    this.requestState = next;
  }

  canMove() {
    // Movement allowed only when not in a requested action state.
    return this.state === "idle" || this.state === "walk";
  }

  setState(next) {
    if (this.state === next) return;
    this.state = next;

    // defaults
    this.needs.boredomRate = 1.5;
    this.needs.energyRate = -10;

    if (next === "walk") {
      this.anim?.setState("walk");
      return;
    }

    if (next === "sleep") {
      this.needs.energyRate = 5;
      this.anim?.setState("sleep");
      return;
    }

    if (next === "music") {
      this.needs.boredomRate = -8;
      this.anim?.setState("listenToMusic");
      return;
    }

    if (next === "eat") {
      this.anim?.setState("eat");
      return;
    }

    // idle
    this.anim?.setState("idle");
  }

  /** Called by Player to indicate locomotion intent */
  setMoving(isMoving) {
    // Don’t let Player override an action state.
    if (this.requestState) return;
    this.setState(isMoving ? "walk" : "idle");
  }

  update() {
    const e = this.needs.energy;

    // 1) If we have a manual request, that is the state (highest priority)
    if (this.requestState) {
      this.setState(this.requestState);
      return;
    }

    // 2) Auto-sleep (only when idle and no manual requests)
    if (this.state === "idle" && e <= this.sleepT) {
      //this.setState("sleep");
      return;
    }

    // Auto-wake
    if (this.state === "sleep" && e >= this.wakeT) {
      this.setState("idle");
      return;
    }

    // 3) If we were in a non-locomotion action (shouldn’t happen without request),
    // snap back to idle.
    if (this.state === "music" || this.state === "eat") {
      this.setState("idle");
    }
  }
}

class Player extends Component {
  constructor(speed = 40, sm = null) {
    super();
    this.speed = speed;
    this.sm = sm;
    this.keyboard = new Keyboard();
  }

  update(dt) {
    if (this.sm && !this.sm.canMove()) return;

    const e = this.entity;
    const sp = this.speed * seconds(dt);
    const { x, y } = moveInput(this.keyboard);

    // facing (engine uses entity.facing for flip)
    if (x !== 0) e.facing = x < 0 ? -1 : 1;

    const moving = x !== 0 || y !== 0;
    this.sm?.setMoving(moving);

    if (!moving) return;

    const n = normalize(x, y);
    e.x += n.x * sp;
    e.y += n.y * sp;
  }
}

// AI for the pet to wander around randomly (X-only, platformer-style)
class WanderAI extends Component {
  constructor({ speed = 25, sm = null, bounds = null } = {}) {
    super();
    this.speed = speed;
    this.sm = sm;

    // bounds in world coords: { xMin, xMax } (y ignored)
    this.bounds = bounds;

    this.mode = "idle"; // "idle" | "walk"
    this.timeLeft = 0;

    this.dir = { x: 0, y: 0 };
  }

  rand(min, max) {
    return min + Math.random() * (max - min);
  }

  pickNewDirection() {
    // platformer: left/right only
    this.dir = { x: Math.random() < 0.5 ? -1 : 1, y: 0 };
  }

  enterIdle() {
    this.mode = "idle";
    this.timeLeft = this.rand(3000, 9000);
    this.dir = { x: 0, y: 0 };
    this.sm?.setMoving(false);
  }

  enterWalk() {
    this.mode = "walk";
    this.timeLeft = this.rand(600, 2000);
    this.pickNewDirection();
    this.sm?.setMoving(true);
  }

  clampToBounds(e) {
    if (!this.bounds) return;
    if (typeof this.bounds.xMin === "number" && typeof this.bounds.xMax === "number") {
      e.x = Math.max(this.bounds.xMin, Math.min(this.bounds.xMax, e.x));
    }
  }

  update(dt) {
    if (this.sm && !this.sm.canMove()) {
      this.sm.setMoving(false);
      return;
    }

    const e = this.entity;

    // bootstrap
    if (this.timeLeft <= 0) {
      this.mode === "idle" ? this.enterWalk() : this.enterIdle();
    }

    this.timeLeft -= dt;

    if (this.mode !== "walk") return;

    const s = dt / 1000;

    // X-only movement
    e.x += this.dir.x * this.speed * s;

    if (this.dir.x !== 0) e.facing = this.dir.x < 0 ? -1 : 1;

    // keep within horizontal bounds
    this.clampToBounds(e);

    // if we hit a wall, bounce to idle so it doesn't scrape edges
    if (this.bounds && typeof this.bounds.xMin === "number" && typeof this.bounds.xMax === "number") {
      const hitX = e.x === this.bounds.xMin || e.x === this.bounds.xMax;
      if (hitX) this.enterIdle();
    }
  }
}

class Actions extends Component {
  constructor(anim, needs, sm, eatAmount = 10) {
    super();
    this.anim = anim; // only used to check if eat animation exists + timing
    this.needs = needs;
    this.sm = sm;
    this.eatAmount = eatAmount;

    this.keyboard = new Keyboard();

    this.isEating = false;
    this.timeLeft = 0;

    this.heldE = false;
    this.heldM = false;
    this.heldQ = false;
  }

  update(dt) {
    // MUSIC (M) toggle
    const downM = this.keyboard.isDown("m");
    if (downM && !this.heldM) {
      this.sm.request(this.sm.requestState === "music" ? null : "music");
    }
    this.heldM = downM;

    // SLEEP (Q) toggle
    const downQ = this.keyboard.isDown("q");
    if (downQ && !this.heldQ) {
      this.sm.request(this.sm.requestState === "sleep" ? null : "sleep");
    }
    this.heldQ = downQ;

    // Don’t allow eating while sleep/music is active
    if (this.sm.state === "sleep" || this.sm.state === "music") return;

    // Eat (E) one-shot (timed)
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
    this.needs.feed(this.eatAmount);
    this.sm.request(null);
  }
}

/* ============================================================================
 *  FACTORIES
 * ============================================================================
 */

const makeSheet = (image) =>
  new SpriteSheet({ image, frameWidth: 16, frameHeight: 16 });

const makeLoop = (
  sheet,
  frameDuration = 120,
  frames = [0, 1, 2, 3, 4, 5, 6, 7]
) =>
  new SpriteAnimation({
    spriteSheet: sheet,
    frames,
    frameDuration,
    loop: true,
  });

const makePet = ({ x = 40, y = 40, z = 1 } = {}) => {
  const { idleImg, walkImg, musicImg, sleepImg, eatImg } = getAsset("pet");

  const pet = new GameObject({
    name: "Pet",
    x,
    y,
    z,
    originX: 8,
    originY: 8,
    originZ: 0,
  });

  const idle = makeLoop(makeSheet(idleImg), 140);
  const walk = makeLoop(makeSheet(walkImg), 80);
  const listenToMusic = makeLoop(makeSheet(musicImg), 180);

  const sleep = new SpriteAnimation({
    spriteSheet: makeSheet(sleepImg),
    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    frameDuration: 100,
    loop: true,
  });

  const eat =
    eatImg &&
    new SpriteAnimation({
      spriteSheet: makeSheet(eatImg),
      frames: Array.from(
        { length: Math.floor(eatImg.width / 16) },
        (_, i) => i
      ),
      frameDuration: 100,
      loop: false,
    });

  const anim = new AnimationController({
    animations: {
      idle,
      walk,
      listenToMusic,
      sleep,
      ...(eat ? { eat } : {}),
    },
    initialState: "idle",
  });

  pet.addComponent(new SpriteRenderer({ animation: anim }));
  return { pet, anim };
};

const makeTree = ({ x = 0, y = 0 } = {}) => {
  const { image } = getAsset("pineTree");

  const tree = new GameObject({
    name: "PineTree",
    x,
    y,
    originX: image.width / 2,
    originY: image.height,
  });

  tree.addComponent(
    new SpriteRenderer({
      sprite: new Sprite({
        image,
        width: image.width,
        height: image.height,
        sx: 0,
        sy: 0,
      }),
    })
  );

  return tree;
};

/* ============================================================================
 *  UI (STATUS PANEL)
 * ============================================================================
 */

const statusPanel = (needs, { x = 8, y = 4, spacing = 10 } = {}) => {
  const { frameImage, blockImage, hungerIconImage, energyIconImage, funIconImage } =
    getAsset("petStatusUi");

  const bars = [
    { icon: hungerIconImage, get: () => 100 - needs.hunger, yOffset: 0 },
    { icon: energyIconImage, get: () => needs.energy, yOffset: spacing },
    { icon: funIconImage, get: () => needs.boredom, yOffset: spacing * 2 },
  ];

  // Frame internals (virtual pixels inside the UI frame)
  const innerX = 1;
  const innerY = Math.floor((frameImage.height - blockImage.height) / 2);

  const blockW = blockImage.width;
  const blockH = blockImage.height;
  const blockStep = blockW;

  const maxBlocks = Math.floor((frameImage.width - innerX * 2) / blockW);
  const gap = 1; // icon -> frame gap in virtual px

  const drawBar = (ctx, scale, { icon, get, yOffset }) => {
    const px = x * scale;
    const py = (y + yOffset) * scale;

    // icon at native size
    ctx.drawImage(icon, px, py, icon.width * scale, icon.height * scale);

    // frame aligned after icon
    const fx = px + (icon.width + gap) * scale;
    const fy = py;
    ctx.drawImage(frameImage, fx, fy, frameImage.width * scale, frameImage.height * scale);

    // blocks
    const filled = Math.round(maxBlocks * clamp01(get() / 100));
    for (let i = 0; i < filled; i++) {
      const bx = (x + (icon.width + gap) + innerX + i * blockStep) * scale;
      const by = (y + yOffset + innerY) * scale;
      ctx.drawImage(blockImage, bx, by, blockW * scale, blockH * scale);
    }
  };

  return {
    update() {},
    draw(ctx, scale) {
      for (const bar of bars) drawBar(ctx, scale, bar);
    },
  };
};

/* ============================================================================
 *  SCENE
 * ============================================================================
 */

class Demo extends Scene {
  constructor() {
    super();
    this.camera.zoom = 1.5;

    const { pet, anim } = makePet({ x: 40, y: 40, z: 1 });

    const needs = pet.addComponent(new Needs());
    const sm = pet.addComponent(new PetSM(needs, anim, 0, 80));

    //pet.addComponent(new Player(40, sm));
    pet.addComponent(new WanderAI({ speed: 25, sm, bounds: { xMin: 16, yMin: 16, xMax: 144, yMax: 128 } }));
    pet.addComponent(new Actions(anim, needs, sm));

    this.addObject(pet);
    this.setCameraTarget(pet);

    this.addObject(makeTree({ x: 60, y: 45 }));
    this.addObject(makeTree({ x: 100, y: 45 }));
    this.addObject(makeTree({ x: 140, y: 45 }));

    this.addUIObject(statusPanel(needs));
  }
}

/* ============================================================================
 *  BOOT
 * ============================================================================
 */

(async () => {
  const canvas = document.getElementById("game");
  if (!canvas) throw new Error("Missing <canvas id='game'/>");

  const images = await assetLoader.loadImages([
    "/examples/demo/assets/pet_idle.png",
    "/examples/demo/assets/pet_walk.png",
    "/examples/demo/assets/pet_music.png",
    "/examples/demo/assets/pet_sleep.png",
    "/examples/demo/assets/pine_tree.png",
    "/examples/demo/assets/status_frame.png",
    "/examples/demo/assets/status_block.png",
    "/examples/demo/assets/hunger_icon.png",
    "/examples/demo/assets/sleep_icon.png",
    "/examples/demo/assets/fun_icon.png",
    "/examples/demo/assets/pet_eat.png",
  ]);

  const [
    idleImg,
    walkImg,
    musicImg,
    sleepImg,
    treeImg,
    frameImage,
    blockImage,
    hungerIconImage,
    energyIconImage,
    funIconImage,
    eatImg,
  ] = images;

  setAsset("pet", { idleImg, walkImg, musicImg, sleepImg, eatImg });
  setAsset("pineTree", { image: treeImg });
  setAsset("petStatusUi", {
    frameImage,
    blockImage,
    hungerIconImage,
    energyIconImage,
    funIconImage,
  });

  const engine = new Engine({
    canvas,
    width: 160,
    height: 144,
    background: "#346856",
  });

  engine.addScene("demo", new Demo());
  engine.setScene("demo");
  engine.start();
})();