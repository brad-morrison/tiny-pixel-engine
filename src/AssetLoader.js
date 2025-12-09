// src/AssetLoader.js

/**
 * AssetLoader
 * ----------------------------------------------
 * Centralised loader for image assets.
 *
 *  - Caches images by src so they are only loaded once
 *  - Returns Promises so callers can await loading
 *
 * Typical usage:
 *   const img = await assetLoader.loadImage("/foo.png");
 * ----------------------------------------------
 */

export class AssetLoader {
  constructor() {
    this.imageCache = new Map(); // src -> Promise<HTMLImageElement>
  }

  loadImage(src) {
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });

    this.imageCache.set(src, promise);
    return promise;
  }

  async loadImages(sources) {
    // sources: array of src strings
    const promises = sources.map((src) => this.loadImage(src));
    return Promise.all(promises);
  }

  clear() {
    this.imageCache.clear();
  }
}

// Convenience singleton instance
export const assetLoader = new AssetLoader();