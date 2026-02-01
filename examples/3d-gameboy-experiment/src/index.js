// src/index.js
export { Engine } from './Engine.js';
export { Scene } from './Scene.js';
export { Sprite } from './Sprite.js';
export { SpriteSheet } from './SpriteSheet.js';
export { SpriteAnimation } from './SpriteAnimation.js';
export { Entity } from './Entity.js';
export { Keyboard } from './Keyboard.js';
export { AnimationController } from './AnimationController.js';
export { assetLoader, AssetLoader } from "./AssetLoader.js";
export { EventBus, globalEventBus } from "./EventBus.js";
export { Camera } from "./Camera.js";

// NEW:
export { GameObject } from "./GameObject.js";
export { Component } from "./Component.js";

// Components
export { SpriteRenderer } from "./components/SpriteRenderer.js";
export { TextLabel } from "./components/TextLabel.js";
export { PointerArea } from "./components/PointerArea.js";