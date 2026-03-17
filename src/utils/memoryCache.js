class MemoryCache {
    constructor({ defaultTtlMs = 0 } = {}) {
        this.defaultTtlMs = defaultTtlMs;
        this.store = new Map();
        this.inFlight = new Map();
    }

    get(key) {
        const cachedEntry = this.store.get(key);

        if (!cachedEntry) {
            return undefined;
        }

        if (cachedEntry.expiresAt !== Infinity && cachedEntry.expiresAt <= Date.now()) {
            this.store.delete(key);
            return undefined;
        }

        return cachedEntry.value;
    }

    set(key, value, ttlMs = this.defaultTtlMs) {
        const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : Infinity;
        this.store.set(key, { value, expiresAt });
        return value;
    }

    async getOrSet(key, loader, { ttlMs = this.defaultTtlMs } = {}) {
        const cachedValue = this.get(key);
        if (cachedValue !== undefined) {
            return cachedValue;
        }

        if (this.inFlight.has(key)) {
            return this.inFlight.get(key);
        }

        const pendingValue = Promise.resolve()
            .then(loader)
            .then((value) => this.set(key, value, ttlMs))
            .finally(() => {
                this.inFlight.delete(key);
            });

        this.inFlight.set(key, pendingValue);
        return pendingValue;
    }

    delete(key) {
        this.store.delete(key);
        this.inFlight.delete(key);
    }

    clearByPrefix(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }

        for (const key of this.inFlight.keys()) {
            if (key.startsWith(prefix)) {
                this.inFlight.delete(key);
            }
        }
    }
}

module.exports = MemoryCache;
