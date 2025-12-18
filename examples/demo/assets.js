// examples/demo/assets.js
const ASSETS = new Map();

export const setAsset = (key, value) => ASSETS.set(key, value);

export const getAsset = (key) => {
  if (!ASSETS.has(key)) throw new Error(`Missing asset: ${key}`);
  return ASSETS.get(key);
};