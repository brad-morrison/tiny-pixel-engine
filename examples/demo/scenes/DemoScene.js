// examples/demo/scenes/DemoScene.js
import { Scene, GameObject, PointerArea } from "../../../src/index.js";
import { getAsset } from "../assets.js";
import { Needs } from "../components/Needs.js";
import { PetSM } from "../components/PetSM.js";
import { WanderAI } from "../components/WanderAI.js";
import { ClickToMove } from "../components/ClickToMove.js";
import { Actions } from "../components/Actions.js";
import { makePet } from "../factories/makePet.js";
import { makeTree } from "../factories/makeTree.js";
import { makeFridge } from "../factories/makeFridge.js";
import { statusPanel } from "../ui/statusPanel.js";

export class DemoScene extends Scene {
  constructor() {
    super();
    this.camera.zoom = 1.5;

    const { pet, anim } = makePet({ x: 40, y: 40, z: 2 });

    const needs = pet.addComponent(new Needs({ maxBlocks: 7 }));
    const sm = pet.addComponent(new PetSM(needs, anim, 0, 80));

    const clickMover = pet.addComponent(
      new ClickToMove({
        speed: 30,
        sm,
        resumeWanderAfterMs: 10000,
        bounds: { xMin: 16, xMax: 144 },
      })
    );

    pet.addComponent(
      new WanderAI({
        speed: 25,
        sm,
        bounds: { xMin: 16, xMax: 144 },
        clickMover,
      })
    );

    pet.addComponent(new Actions(anim, needs, sm));

    // Ground click catcher
    const ground = new GameObject({ name: "Ground", x: 0, y: 0, z: -999 });
    ground.addComponent(
      new PointerArea({
        width: 160,
        height: 144,
        onClick: ({ worldX }) => clickMover.setTarget(worldX),
      })
    );
    this.addObject(ground);

    this.addObject(pet);
    this.setCameraTarget(pet);

    this.addObject(makeTree({ x: 60, y: 45 }));
    this.addObject(makeTree({ x: 100, y: 45 }));
    this.addObject(makeTree({ x: 140, y: 45 }));

    this.addObject(makeFridge({ x: 60, y: 45 }));

    this.addUIObject(statusPanel(needs, getAsset));
  }

  // DEBUG: draw wander bounds
  draw(ctx, scale) {
    super.draw(ctx, scale);

    // DEBUG: wander bounds in WORLD space (so it matches actual bounds)
    const xMin = 16;
    const xMax = 144;

    const worldScale = scale * (this.camera.zoom || 1);

    ctx.save();

    // apply the SAME camera transform the engine uses for world rendering
    ctx.translate(
      -(this.camera.x || 0) * worldScale,
      -(this.camera.y || 0) * worldScale
    );

    ctx.strokeStyle = "red";
    ctx.lineWidth = worldScale;

    // left bound
    ctx.beginPath();
    ctx.moveTo(Math.round(xMin * worldScale) + 0.5, 0);
    ctx.lineTo(Math.round(xMin * worldScale) + 0.5, 144 * worldScale);
    ctx.stroke();

    // right bound
    ctx.beginPath();
    ctx.moveTo(Math.round(xMax * worldScale) + 0.5, 0);
    ctx.lineTo(Math.round(xMax * worldScale) + 0.5, 144 * worldScale);
    ctx.stroke();

    ctx.restore();
  }
}