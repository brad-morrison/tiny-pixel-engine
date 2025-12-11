// examples/demo/scenes/DemoScene.js
import { Scene } from "../../../src/index.js";
import { PetPrefab } from "../gameobjects/PetPrefab.js";
import { PineTreePrefab } from "../gameobjects/PineTreePrefab.js";
import { PlayerController } from "../components/PlayerController.js";

export class DemoScene extends Scene {
  constructor() {
    super();

    // 1) Build the Pet from prefab (assets come from AssetRegistry)
    const { pet, animations } = PetPrefab.instantiate({
      x: 40,
      y: 40,
    });

    // 2) Attach behaviour (input + animation state switching)
    pet.addComponent(
      new PlayerController(animations, {
        speed: 40,
      })
    );

    // 3) Add to scene + camera
    this.addObject(pet);
    this.setCameraTarget(pet);

    const tree = PineTreePrefab.instantiate({
      x: 100,
      y: 0,
    });

    const tree2 = PineTreePrefab.instantiate({
      x: 60,
      y: 0,
    });

    const tree3 = PineTreePrefab.instantiate({
      x: 140,
      y: 0,
    });

    this.addObject(tree);
    this.addObject(tree2);
    this.addObject(tree3);

    // Optional references
    this.pet = pet;
    this.petAnimations = animations;
    this.tree = tree;
    this.tree2 = tree2;
  }
}