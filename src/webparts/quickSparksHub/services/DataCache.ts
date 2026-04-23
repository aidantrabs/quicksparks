export class DataCache<T> {
    private _data: T | null = null;
    private _fetchedAt: number = 0;
    private _ttlMs: number;
    private _pendingFetch: Promise<T> | null = null;
    private _errorBackoffUntil: number = 0;
    private _consecutiveErrors: number = 0;

    constructor(ttlMs: number = 5 * 60 * 1000) {
        this._ttlMs = ttlMs;
    }

    public async get(fetcher: () => Promise<T>): Promise<T> {
        if (this._data && Date.now() - this._fetchedAt < this._ttlMs) {
            return this._data;
        }

        if (Date.now() < this._errorBackoffUntil) {
            throw new Error('Data fetch failed recently. Retrying shortly.');
        }

        if (!this._pendingFetch) {
            this._pendingFetch = fetcher()
                .then((data) => {
                    this._data = data;
                    this._fetchedAt = Date.now();
                    this._pendingFetch = null;
                    this._consecutiveErrors = 0;
                    this._errorBackoffUntil = 0;
                    return data;
                })
                .catch((err) => {
                    this._pendingFetch = null;
                    this._consecutiveErrors++;
                    const backoffMs = Math.min(1000 * 2 ** this._consecutiveErrors, 30000);
                    this._errorBackoffUntil = Date.now() + backoffMs;
                    throw err;
                });
        }

        return this._pendingFetch;
    }

    public invalidate(): void {
        this._data = null;
        this._fetchedAt = 0;
    }
}
