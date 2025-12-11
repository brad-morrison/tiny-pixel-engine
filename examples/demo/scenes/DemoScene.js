// examples/demo/scenes/DemoScene.js
import { Scene, GameObject, TextLabel } from "../../../src/index.js";
import { PetPrefab } from "../gameobjects/PetPrefab.js";
import { PineTreePrefab } from "../gameobjects/PineTreePrefab.js";
import { PlayerController } from "../components/PlayerController.js";
import { PetNeeds } from "../components/PetNeeds.js";
import { PetStatusUI } from "../components/PetStatusUI.js";
import { AssetRegistry } from "../AssetRegistry.js";

export class DemoScene extends Scene {
  constructor() {
    super();

    // Zoom in the world by 2x (try 1.5, 2, 3 etc.)
    this.camera.zoom = 3;

    // 1) Build the Pet from prefab (assets come from AssetRegistry)
    const { pet, animations } = PetPrefab.instantiate({
      x: 40,
      y: 40,
    });

    // 2) Attach needs + behaviour
    const needs = pet.addComponent(new PetNeeds());

    pet.addComponent(
      new PlayerController(animations, {
        speed: 40,
      })
    );

    // 3) Add pet to world + camera
    this.addObject(pet);
    this.setCameraTarget(pet);

    // 4) Trees (world objects)
    const tree = PineTreePrefab.instantiate({ x: 100, y: 0 });
    const tree2 = PineTreePrefab.instantiate({ x: 60, y: 0 });
    const tree3 = PineTreePrefab.instantiate({ x: 140, y: 0 });

    this.addObject(tree);
    this.addObject(tree2);
    this.addObject(tree3);

    // 5) UI GameObject with status bars
    const ui = new GameObject({ name: "PetStatusUI" });

    ui.addComponent(
      new PetStatusUI(needs, {
        x: 4,
        y: 4,
        width: 70,
        barHeight: 4,
      })
    );

    this.addUIObject(ui);


    // Optional references
    this.pet = pet;
    this.petAnimations = animations;
    this.petNeeds = needs;
    this.tree = tree;
    this.tree2 = tree2;
    this.tree3 = tree3;
    this.ui = ui;
  }
}