class Session {
  constructor(name = 'session', { storage = localStorage } = {}) {
    this.name = name;
    this.storage = storage;
    this.restore();
  }

  clear() {
    this.raw = {};
    this.save();
  }

  delete(key) {
    const value = this.raw[key];
    this.raw[key] = undefined;
    this.save();
    return value;
  }

  get(key) {
    return this.raw[key];
  }

  restore() {
    this.raw = JSON.parse(this.storage.getItem(this.name) || '{}');
  }

  save() {
    this.storage.setItem(this.name, JSON.stringify(this.raw));
  }

  set(key, value) {
    this.raw[key] = value;
    this.save();
  }
}

export default new Session();
