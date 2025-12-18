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
  PointerArea,
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
const seconds = (dtMs) => dtMs / 1000;

const key = (keyboard, name) => keyboard.isDown(name);

const moveInput = (k) => {
  const left = key(k, "ArrowLeft") || key(k, "a");
  const right = key(k, "ArrowRight") || key(k, "d");
  const up = key(k, "ArrowUp") || key(k, "w");
  const down = key(k, "ArrowDown") || key(k, "s");

  return {
    x: (right ? 1 : 0) - (left ? 1 : 0),
    y: (down ? 0 : 0) - (up ? 0 : 0), // vertical disabled for platformer lane
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

    // Current values (higher = better)
    this.hunger = maxBlocks;
    this.energy = maxBlocks;
    this.happiness = maxBlocks;

    // Activity flags set by your state machine
    this.isSleeping = false;
    this.isListening = false;

    // intervals
    this.hungerLoseEverySec = hungerLoseEverySec;
    this.energyLoseEverySec = energyLoseEverySec;
    this.happinessLoseEverySec = happinessLoseEverySec;

    this.energyGainEverySecWhileSleeping = energyGainEverySecWhileSleeping;
    this.happinessGainEverySecWhileMusic = happinessGainEverySecWhileMusic;

    // timers (accumulators)
    this._hungerLoseT = 0;
    this._energyLoseT = 0;
    this._happinessLoseT = 0;

    this._energyGainT = 0;
    this._happinessGainT = 0;
  }

  clampBlocks(v) {
    return Math.max(0, Math.min(this.maxBlocks, v));
  }

  // Called by SM
  setSleeping(on) {
    this.isSleeping = !!on;
    if (!on) this._energyGainT = 0;
  }

  setListening(on) {
    this.isListening = !!on;
    if (!on) this._happinessGainT = 0;
  }

  // Called by Actions on eat
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

    // baseline decay
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

    // conditional regen
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

/**
 * ClickToMove (NO SMOOTHING)
 * - X-only move toward target
 * - When arrived, waits N ms then releases control (wandering resumes)
 */
class ClickToMove extends Component {
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

/**
 * PetSM = single source of truth for:
 * - current state
 * - animation selection
 * - stat rate tweaks while in a state
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
    this.requestState = next; // null | "sleep" | "music" | "eat"
  }

  canMove() {
    return this.state === "idle" || this.state === "walk";
  }

  setState(next) {
    if (this.state === next) return;
    this.state = next;

    // tell Needs which regen should run
    this.needs.setSleeping(next === "sleep");
    this.needs.setListening(next === "music");

    if (next === "walk") {
      this.anim?.setState("walk");
      return;
    }
    if (next === "sleep") {
      this.anim?.setState("sleep");
      return;
    }
    if (next === "music") {
      this.anim?.setState("listenToMusic");
      return;
    }
    if (next === "eat") {
      this.anim?.setState("eat");
      return;
    }

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

    // auto-sleep disabled right now
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

    if (x !== 0) e.facing = x < 0 ? -1 : 1;

    const moving = x !== 0 || y !== 0;
    this.sm?.setMoving(moving);

    if (!moving) return;

    const n = normalize(x, y);
    e.x += n.x * sp;
    e.y += n.y * sp;
  }
}

// WanderAI (X-only). Pauses when ClickToMove is active.
class WanderAI extends Component {
  constructor({ speed = 25, sm = null, bounds = null, clickMover = null } = {}) {
    super();
    this.speed = speed;
    this.sm = sm;
    this.bounds = bounds; // { xMin, xMax }
    this.clickMover = clickMover;

    this.mode = "idle"; // "idle" | "walk"
    this.timeLeft = 0;
    this.dir = { x: 0, y: 0 };
  }

  rand(min, max) {
    return min + Math.random() * (max - min);
  }

  pickNewDirection() {
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
    const { xMin, xMax } = this.bounds;
    if (typeof xMin === "number" && typeof xMax === "number") {
      e.x = Math.max(xMin, Math.min(xMax, e.x));
    }
  }

  update(dt) {
    if (this.clickMover?.active) return;

    if (this.sm && !this.sm.canMove()) {
      this.sm.setMoving(false);
      return;
    }

    const e = this.entity;

    if (this.timeLeft <= 0) {
      this.mode === "idle" ? this.enterWalk() : this.enterIdle();
    }

    this.timeLeft -= dt;

    if (this.mode !== "walk") return;

    const s = dt / 1000;
    e.x += this.dir.x * this.speed * s;

    if (this.dir.x !== 0) e.facing = this.dir.x < 0 ? -1 : 1;

    this.clampToBounds(e);

    if (this.bounds) {
      const hitX = e.x === this.bounds.xMin || e.x === this.bounds.xMax;
      if (hitX) this.enterIdle();
    }
  }
}

class Actions extends Component {
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

    // no eating while sleep/music is active
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
    this.needs.eat(1);
    this.sm.request(null);
  }
}

/* ============================================================================
 *  FACTORIES
 * ============================================================================
 */

const makeSheet = (image) => new SpriteSheet({ image, frameWidth: 16, frameHeight: 16 });

const makeLoop = (sheet, frameDuration = 120, frames = [0, 1, 2, 3, 4, 5, 6, 7]) =>
  new SpriteAnimation({
    spriteSheet: sheet,
    frames,
    frameDuration,
    loop: true,
  });

const makePet = ({ x = 40, y = 40, z } = {}) => {
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
      frames: Array.from({ length: Math.floor(eatImg.width / 16) }, (_, i) => i),
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

const makeFridge = ({ x = 0, y = 0 } = {}) => {
  const { image } = getAsset("fridgeAnim");

  const FRAME_W = 37;
  const FRAME_H = 30;

  const fridge = new GameObject({
    name: "Fridge",
    x,
    y,
    originX: FRAME_W / 2,
    originY: FRAME_H,
  });

  const sheet = new SpriteSheet({
    image,
    frameWidth: FRAME_W,
    frameHeight: FRAME_H,
  });

  const anim = new AnimationController({
    animations: {
      closed: new SpriteAnimation({
        spriteSheet: sheet,
        frames: [0],
        frameDuration: 1000,
        loop: false,
      }),
      open: new SpriteAnimation({
        spriteSheet: sheet,
        frames: [0, 1, 2, 3, 4, 5],
        frameDuration: 80,
        loop: false,
      }),
      close: new SpriteAnimation({
        spriteSheet: sheet,
        frames: [5, 4, 3, 2, 1, 0],
        frameDuration: 40,
        loop: false,
      }),
    },
    initialState: "closed",
  });

  fridge.addComponent(new SpriteRenderer({ animation: anim }));

  let isOpen = false;
  fridge.z = 1;

  fridge.addComponent(
    new PointerArea({
      width: FRAME_W,
      height: FRAME_H,
      onClick: () => {
        isOpen = !isOpen;
        anim.setState(isOpen ? "open" : "close");
      },
    })
  );

  return fridge;
};

/* ============================================================================
 *  UI (STATUS PANEL)
 * ============================================================================
 */

const statusPanel = (needs, { x = 8, y = 4, spacing = 10 } = {}) => {
  const { frameImage, blockImage, hungerIconImage, energyIconImage, funIconImage } = getAsset("petStatusUi");

  const bars = [
    { icon: hungerIconImage, get: () => needs.hunger, yOffset: 0 },
    { icon: energyIconImage, get: () => needs.energy, yOffset: spacing },
    { icon: funIconImage, get: () => needs.happiness, yOffset: spacing * 2 },
  ];

  const innerX = 1;
  const innerY = Math.floor((frameImage.height - blockImage.height) / 2);

  const blockW = blockImage.width;
  const blockH = blockImage.height;
  const blockStep = blockW;

  const maxBlocks = needs.maxBlocks;
  const gap = 1;

  const drawBar = (ctx, scale, { icon, get, yOffset }) => {
    const px = x * scale;
    const py = (y + yOffset) * scale;

    ctx.drawImage(icon, px, py, icon.width * scale, icon.height * scale);

    const fx = px + (icon.width + gap) * scale;
    const fy = py;
    ctx.drawImage(frameImage, fx, fy, frameImage.width * scale, frameImage.height * scale);

    const filled = Math.max(0, Math.min(maxBlocks, Math.round(get())));
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

    const { pet, anim } = makePet({ x: 40, y: 40, z: 2 });

    const needs = pet.addComponent(new Needs({ maxBlocks: 7 }));
    const sm = pet.addComponent(new PetSM(needs, anim, 0, 80));

    // click-to-move
    const clickMover = pet.addComponent(
      new ClickToMove({
        speed: 30,
        sm,
        resumeWanderAfterMs: 5000,
        bounds: { xMin: 16, xMax: 144 },
      })
    );

    // wandering (pauses when clickMover.active)
    pet.addComponent(
      new WanderAI({
        speed: 25,
        sm,
        bounds: { xMin: 16, xMax: 144 },
        clickMover,
      })
    );

    pet.addComponent(new Actions(anim, needs, sm));

    // GROUND click catcher (world size 160x144)
    const ground = new GameObject({ name: "Ground", x: 0, y: 0, z: -999 });
    ground.addComponent(
      new PointerArea({
        width: 160,
        height: 144,
        onClick: ({ worldX }) => {
          clickMover.setTarget(worldX);
        },
      })
    );
    this.addObject(ground);

    this.addObject(pet);
    this.setCameraTarget(pet);

    this.addObject(makeTree({ x: 60, y: 45 }));
    this.addObject(makeTree({ x: 100, y: 45 }));
    this.addObject(makeTree({ x: 140, y: 45 }));

    this.addObject(makeFridge({ x: 60, y: 45 }));

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
    "/examples/demo/assets/fridge_anim.png",
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
    fridgeAnim,
  ] = images;

  setAsset("pet", { idleImg, walkImg, musicImg, sleepImg, eatImg });
  setAsset("pineTree", { image: treeImg });
  setAsset("fridgeAnim", { image: fridgeAnim });
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