import { Engine } from "../../src/index.js";

const canvas = document.getElementById("game");
const engine = new Engine({ canvas });

console.log("Engine created:", engine);