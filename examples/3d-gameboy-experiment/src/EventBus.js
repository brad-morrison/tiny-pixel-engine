// src/EventBus.js

/**
 * EventBus
 * ----------------------------------------------
 * Lightweight pub/sub event system.
 *
 *  - on(eventName, handler)
 *  - off(eventName, handler)
 *  - emit(eventName, payload)
 *
 * Use it to decouple systems, e.g. controllers,
 * UI, game logic, and engine integrations.
 * ----------------------------------------------
 */

export class EventBus {
  constructor() {
    this.listeners = new Map(); // eventName -> Set<handler>
  }

  on(eventName, handler) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(handler);
  }

  off(eventName, handler) {
    const set = this.listeners.get(eventName);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      this.listeners.delete(eventName);
    }
  }

  emit(eventName, payload) {
    const set = this.listeners.get(eventName);
    if (!set) return;
    for (const handler of set) {
      handler(payload);
    }
  }

  clear() {
    this.listeners.clear();
  }
}

// Convenience global bus if you want a shared one
export const globalEventBus = new EventBus();