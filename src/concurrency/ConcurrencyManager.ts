/**
 * Week 15: Concurrency
 * Concurrent request management with race condition prevention
 * Two models for Concurrent Programming:
 * 1. Promise-based async/await
 * 2. Request queuing with mutex-like behavior
 * 
 * Demonstrates:
 * - Avoiding race conditions
 * - Proper synchronization of concurrent operations
 * - Difficulty in testing concurrent code
 */

/**
 * Request Queue with FIFO ordering
 * Prevents race conditions by serializing requests
 */
class RequestQueue {
  private queue: Array<() => Promise<unknown>> = [];
  private isProcessing = false;

  /**
   * Enqueue async operation
   * Precondition: fn must be async function
   * Postcondition: Operation executes after all prior operations
   */
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  /**
   * Process queue in order
   * Race condition prevention: only one operation at a time
   */
  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error("Error in queued operation:", error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get current queue size
   */
  size(): number {
    return this.queue.length;
  }
}

/**
 * Semaphore for limiting concurrent operations
 * Demonstrates proper concurrent programming patterns
 */
export class Semaphore {
  private permits: number;
  private waitingPromises: Array<() => void> = [];

  constructor(maxPermits: number = 1) {
    this.permits = maxPermits;
  }

  /**
   * Acquire permit
   * Blocks if no permits available
   * Precondition: maxPermits > 0
   * Postcondition: Permit acquired or waits
   */
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise((resolve) => {
      this.waitingPromises.push(() => {
        this.permits--;
        resolve();
      });
    });
  }

  /**
   * Release permit
   * Allows waiting operation to acquire
   * Postcondition: Next waiting operation can proceed
   */
  release(): void {
    const resolve = this.waitingPromises.shift();
    if (resolve) {
      resolve();
    } else {
      this.permits++;
    }
  }

  /**
   * Execute operation with semaphore protection
   * Precondition: fn must be async
   * Postcondition: Operation executes with permit held
   */
  async withPermit<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

/**
 * Cache with TTL (Time To Live) and concurrent access control
 * Demonstrates managing shared state in concurrent environment
 */
export class ConcurrentCache<K, V> {
  private cache: Map<K, { value: V; expiresAt: number }> = new Map();
  private semaphore: Semaphore;

  constructor(maxConcurrentAccess: number = 1) {
    this.semaphore = new Semaphore(maxConcurrentAccess);
  }

  /**
   * Get value from cache
   * Returns null if not found or expired
   */
  async get(key: K): Promise<V | null> {
    return this.semaphore.withPermit(async () => {
      const entry = this.cache.get(key);

      if (!entry) return null;

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        return null;
      }

      return entry.value;
    });
  }

  /**
   * Set value in cache with TTL
   * Precondition: ttlMs > 0
   * Postcondition: Value stored with expiration time
   */
  async set(key: K, value: V, ttlMs: number = 60000): Promise<void> {
    return this.semaphore.withPermit(async () => {
      this.cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });
    });
  }

  /**
   * Clear cache
   */
  async clear(): Promise<void> {
    return this.semaphore.withPermit(async () => {
      this.cache.clear();
    });
  }

  /**
   * Get cache size
   */
  async size(): Promise<number> {
    return this.semaphore.withPermit(async () => {
      return this.cache.size;
    });
  }
}

/**
 * Request debouncer
 * Prevents multiple rapid identical requests
 * Common concurrency pattern for API calls
 */
export class RequestDebouncer<T> {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastValue: T | null = null;
  private delayMs: number;

  constructor(delayMs: number = 500) {
    this.delayMs = delayMs;
  }

  /**
   * Debounce request
   * Precondition: callback is async function
   * Postcondition: Callback executed after delay with no new requests
   */
  debounce(callback: () => Promise<void>): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      callback();
      this.timeoutId = null;
    }, this.delayMs);
  }

  /**
   * Cancel pending debounced request
   */
  cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * Request throttler
 * Limits request frequency to at most one per interval
 * Another concurrency pattern
 */
export class RequestThrottler {
  private lastExecutionTime: number = 0;
  private minIntervalMs: number;

  constructor(minIntervalMs: number = 500) {
    this.minIntervalMs = minIntervalMs;
  }

  /**
   * Execute operation with throttling
   * Only executes if enough time has passed since last execution
   */
  async throttle<T>(fn: () => Promise<T>): Promise<T | null> {
    const now = Date.now();

    if (now - this.lastExecutionTime < this.minIntervalMs) {
      return null; // Too soon, skip execution
    }

    this.lastExecutionTime = now;
    return fn();
  }

  /**
   * Reset throttle timer
   */
  reset(): void {
    this.lastExecutionTime = 0;
  }
}

/**
 * Batch processor for concurrent operations
 * Collects requests and processes them together
 * Reduces overhead and race conditions
 */
export class BatchProcessor<T, R> {
  private batch: T[] = [];
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private batchSizeThreshold: number;
  private delayMs: number;
  private processor: (items: T[]) => Promise<R[]>;
  private semaphore: Semaphore;

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    batchSizeThreshold: number = 10,
    delayMs: number = 100
  ) {
    this.processor = processor;
    this.batchSizeThreshold = batchSizeThreshold;
    this.delayMs = delayMs;
    this.semaphore = new Semaphore(1); // Single thread for batch processing
  }

  /**
   * Add item to batch
   * Automatically processes batch when threshold reached
   */
  async add(item: T): Promise<R[]> {
    return this.semaphore.withPermit(async () => {
      this.batch.push(item);

      if (this.batch.length >= this.batchSizeThreshold) {
        return this.flushBatch();
      }

      // Schedule batch processing
      if (this.timeoutId === null) {
        this.timeoutId = setTimeout(() => {
          this.flushBatch();
        }, this.delayMs);
      }

      return [];
    });
  }

  /**
   * Process accumulated batch
   */
  private async flushBatch(): Promise<R[]> {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.batch.length === 0) {
      return [];
    }

    const itemsToProcess = [...this.batch];
    this.batch = [];

    return this.processor(itemsToProcess);
  }
}

/**
 * Race condition safe counter
 * Demonstrates atomic operations
 */
export class AtomicCounter {
  private value: number = 0;
  private semaphore: Semaphore;

  constructor() {
    this.semaphore = new Semaphore(1);
  }

  /**
   * Increment counter atomically
   */
  async increment(): Promise<number> {
    return this.semaphore.withPermit(async () => {
      this.value++;
      return this.value;
    });
  }

  /**
   * Decrement counter atomically
   */
  async decrement(): Promise<number> {
    return this.semaphore.withPermit(async () => {
      this.value--;
      return this.value;
    });
  }

  /**
   * Get current value
   */
  async get(): Promise<number> {
    return this.semaphore.withPermit(async () => {
      return this.value;
    });
  }

  /**
   * Set value atomically
   */
  async set(newValue: number): Promise<void> {
    return this.semaphore.withPermit(async () => {
      this.value = newValue;
    });
  }
}

/**
 * Promise utilities for concurrent programming
 */
export class ConcurrencyUtils {
  /**
   * Race multiple promises (like Promise.race but typed better)
   */
  static race<T>(promises: Promise<T>[]): Promise<T> {
    return Promise.race(promises);
  }

  /**
   * All with timeout
   * Rejects if any promise takes longer than timeout
   */
  static async allWithTimeout<T>(promises: Promise<T>[], timeoutMs: number): Promise<T[]> {
    const timeoutPromise = new Promise<T[]>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    );

    return Promise.race([Promise.all(promises), timeoutPromise]);
  }

  /**
   * Retry with exponential backoff
   * Demonstrates resilient concurrent programming
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelayMs: number = 100
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts - 1) {
          const delayMs = baseDelayMs * Math.pow(2, attempt); // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }
}
