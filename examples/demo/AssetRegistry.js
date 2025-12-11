// examples/demo/AssetRegistry.js

// Simple in-memory store just for this demo.
// You can later move this into src/ if you like.
const _assets = {};

export const AssetRegistry = {
  /**
   * Store a value under a key.
   * Example:
   *   AssetRegistry.store("pet", { idleImg, walkImg, ... })
   */
  store(key, value) {
    _assets[key] = value;
  },

  /**
   * Retrieve a value by key.
   * Throws a helpful error if missing.
   */
  get(key) {
    const value = _assets[key];
    if (!value) {
      throw new Error(`AssetRegistry: no assets stored under key "${key}"`);
    }
    return value;
  },
};