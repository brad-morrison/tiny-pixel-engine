// examples/demo/scenes/DemoScene.js
import { Scene, GameObject, TextLabel } from "../../../src/index.js";
import { PetPrefab } from "../gameobjects/PetPrefab.js";
import { PineTreePrefab } from "../gameobjects/PineTreePrefab.js";
import { PlayerController } from "../components/PlayerController.js";
import { PetNeeds } from "../components/PetNeeds.js";
import { PetStateMachine } from "../components/PetStateMachine.js";
import { PetStatusBar } from "../components/PetStatusBar.js";
import { AssetRegistry } from "../AssetRegistry.js";

export class DemoScene extends Scene {
  constructor() {
    super();

    // Zoom in the world by 2x (try 1.5, 2, 3 etc.)
    this.camera.zoom = 1.5;

    // 1) Build the Pet from prefab (assets come from AssetRegistry)
    const { pet, animations } = PetPrefab.instantiate({
      x: 40,
      y: 40,
    });

    // 2) Attach needs + behaviour
    const needs = pet.addComponent(new PetNeeds());

    // 2a) Create state machine (must be before PlayerController)
    const stateMachine = pet.addComponent(
      new PetStateMachine({
        petNeeds: needs,
        animationController: animations,
        sleepEnergyThreshold: 0,
        wakeEnergyThreshold: 80,
      })
    );

    pet.addComponent(
      new PlayerController(animations, {
        speed: 40,
      }, stateMachine)
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
    // Create individual PetStatusBar gameobjects for each need
    const uiAssets = AssetRegistry.get("petStatusUi");

    const hungerBar = new PetStatusBar(uiAssets.hungerIconImage, needs.hunger, { x: 13, y: 4, width: 28, height: 8, frameImage: uiAssets.frameImage, blockImage: uiAssets.blockImage });
    const energyBar = new PetStatusBar(uiAssets.energyIconImage, needs.energy, { x: 13, y: 13, width: 28, height: 8, frameImage: uiAssets.frameImage, blockImage: uiAssets.blockImage });
    const funBar = new PetStatusBar(uiAssets.funIconImage, needs.boredom, { x: 57, y: 4, width: 28, height: 8, frameImage: uiAssets.frameImage, blockImage: uiAssets.blockImage });
    const hungerBar2 = new PetStatusBar(uiAssets.hungerIconImage, needs.hunger, { x: 57, y: 13, width: 28, height: 8, frameImage: uiAssets.frameImage, blockImage: uiAssets.blockImage });

    this.addUIObject(hungerBar);
    this.addUIObject(energyBar);
    this.addUIObject(funBar);
    this.addUIObject(hungerBar2);

    // Keep references to update externally if needed
    this.hungerBar = hungerBar;
    this.energyBar = energyBar;
    this.funBar = funBar;
    this.hungerBar2 = hungerBar2;


    // Optional references
    this.pet = pet;
    this.petAnimations = animations;
    this.petNeeds = needs;
    this.petStateMachine = stateMachine;
    this.tree = tree;
    this.tree2 = tree2;
    this.tree3 = tree3;
    //this.ui = ui;
  }

  update(dt) {
    // let base scene run (camera, objects, ui objects, etc.)
    super.update(dt);

    // Sync UI bars to needs
    if (this.hungerBar) this.hungerBar.setValue(this.petNeeds.hunger);
    if (this.energyBar) this.energyBar.setValue(this.petNeeds.energy);
    if (this.funBar) this.funBar.setValue(this.petNeeds.boredom);
  }
}