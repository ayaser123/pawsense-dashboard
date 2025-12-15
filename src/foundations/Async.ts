/**
 * Week 9: Asynchronous Programming and Error Handling
 * 
 * Demonstrates:
 * - Callbacks
 * - Promises
 * - Async/Await
 * - Error handling
 * - Try/catch/finally
 * - Error propagation
 */

// ============================================================================
// CALLBACKS
// ============================================================================

/**
 * Week 9: Callbacks - pass function to be called later
 * Problem: "Callback Hell" - deeply nested callbacks hard to read
 */
export class CallbackExamples {
  /**
   * Simple callback
   */
  fetchUserData(
    userId: string,
    callback: (error: string | null, data?: { name: string }) => void
  ): void {
    setTimeout(() => {
      if (userId) {
        callback(null, { name: "Max" });
      } else {
        callback("User not found");
      }
    }, 100);
  }

  /**
   * Callback hell - hard to read
   * Get user -> Get pets -> Get vet -> Process all
   */
  fetchUserPetsVetHell(
    userId: string,
    callback: (error: string | null, result?: string) => void
  ): void {
    this.fetchUserData(userId, (err1, user) => {
      if (err1) {
        callback(err1);
        return;
      }

      this.fetchUserPets(user!.name, (err2, pets) => {
        if (err2) {
          callback(err2);
          return;
        }

        this.findNearbyVets(pets[0].location, (err3, vets) => {
          if (err3) {
            callback(err3);
            return;
          }

          callback(null, `${user!.name} has ${pets.length} pets near ${vets[0]}`);
        });
      });
    });
  }

  /**
   * Helper functions to use in examples
   */
  private fetchUserPets(
    userName: string,
    callback: (error: string | null, data?: { name: string; location: string }[]) => void
  ): void {
    setTimeout(() => {
      callback(null, [{ name: "Max", location: "home" }]);
    }, 100);
  }

  private findNearbyVets(
    location: string,
    callback: (error: string | null, data?: string[]) => void
  ): void {
    setTimeout(() => {
      callback(null, ["Dr. Smith Vet Clinic"]);
    }, 100);
  }
}

// ============================================================================
// PROMISES
// ============================================================================

/**
 * Week 9: Promises - better than callbacks
 * States: Pending -> Fulfilled (resolved) or Rejected
 */
export class PromiseExamples {
  /**
   * Create a promise
   */
  fetchUserDataPromise(userId: string): Promise<{ name: string }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userId) {
          resolve({ name: "Max" });
        } else {
          reject(new Error("User not found"));
        }
      }, 100);
    });
  }

  /**
   * Promise.then() - handle resolved value
   */
  getUserNameThen(userId: string): void {
    this.fetchUserDataPromise(userId)
      .then((user) => {
        console.log(`User: ${user.name}`);
      })
      .catch((error) => {
        console.error(`Error: ${error.message}`);
      });
  }

  /**
   * Promise chaining - resolve -> next task
   * Better than callback hell, but still hard to read
   */
  fetchUserPetsVetChain(userId: string): Promise<string> {
    return this.fetchUserDataPromise(userId)
      .then((user) =>
        this.fetchPets(user.name).then((pets) => ({
          user,
          pets,
        }))
      )
      .then(({ user, pets }) =>
        this.findVets(pets[0].location).then((vets) => ({
          user,
          pets,
          vets,
        }))
      )
      .then(({ user, pets, vets }) => {
        return `${user.name} has ${pets.length} pets near ${vets[0]}`;
      });
  }

  /**
   * Promise.all - wait for all promises
   * Time: same as slowest promise
   */
  getAllDataParallel(userId: string): Promise<{
    user: { name: string };
    pets: { name: string }[];
    vets: string[];
  }> {
    const userPromise = this.fetchUserDataPromise(userId);
    const petsPromise = this.fetchPets("Max");
    const vetsPromise = this.findVets("home");

    return Promise.all([userPromise, petsPromise, vetsPromise]).then(
      ([user, pets, vets]) => ({ user, pets, vets })
    );
  }

  /**
   * Promise.race - first to complete wins
   */
  fastestRequest(userId: string): Promise<string> {
    const api1 = new Promise<string>((resolve) =>
      setTimeout(() => resolve("API 1"), 100)
    );
    const api2 = new Promise<string>((resolve) =>
      setTimeout(() => resolve("API 2"), 50)
    );

    return Promise.race([api1, api2]); // Returns "API 2" (faster)
  }

  private fetchPets(
    userName: string
  ): Promise<{ name: string; location: string }[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([{ name: "Max", location: "home" }]);
      }, 100);
    });
  }

  private findVets(location: string): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(["Dr. Smith Vet Clinic"]);
      }, 100);
    });
  }
}

// ============================================================================
// ASYNC/AWAIT
// ============================================================================

/**
 * Week 9: Async/Await - cleanest syntax for async code
 * Makes asynchronous code look synchronous
 */
export class AsyncAwaitExamples {
  /**
   * Async function - returns Promise
   */
  async fetchUser(userId: string): Promise<{ name: string }> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ name: "Max" }), 100);
    });
  }

  /**
   * Await - wait for promise to resolve
   * Only works inside async function
   */
  async getUserName(userId: string): Promise<string> {
    const user = await this.fetchUser(userId);
    return user.name;
  }

  /**
   * Clean async flow - like synchronous code
   * Compare to callback hell above!
   */
  async fetchUserPetsVetClean(userId: string): Promise<string> {
    try {
      const user = await this.fetchUser(userId);
      const pets = await this.fetchPets(user.name);
      const vets = await this.findVets(pets[0].location);

      return `${user.name} has ${pets.length} pets near ${vets[0]}`;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  /**
   * Parallel with async - use Promise.all
   */
  async getAllDataParallel(userId: string) {
    try {
      const [user, pets, vets] = await Promise.all([
        this.fetchUser(userId),
        this.fetchPets("Max"),
        this.findVets("home"),
      ]);

      return { user, pets, vets };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  /**
   * Loop with async
   */
  async processMultipleUsers(userIds: string[]): Promise<string[]> {
    const results: string[] = [];

    for (const userId of userIds) {
      const user = await this.fetchUser(userId);
      results.push(user.name);
    }

    return results;
  }

  /**
   * Parallel loop - faster than sequential
   */
  async processMultipleUsersParallel(userIds: string[]): Promise<string[]> {
    const promises = userIds.map((userId) => this.fetchUser(userId));
    const users = await Promise.all(promises);
    return users.map((u) => u.name);
  }

  private async fetchPets(userName: string) {
    return new Promise<{ name: string; location: string }[]>((resolve) => {
      setTimeout(() => resolve([{ name: "Max", location: "home" }]), 100);
    });
  }

  private async findVets(location: string): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(["Dr. Smith Vet Clinic"]), 100);
    });
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Week 9: Error handling - gracefully handle failures
 */
export class ErrorHandling {
  /**
   * Try/catch - catch synchronous errors
   */
  parseJSON(jsonString: string): object {
    try {
      const data = JSON.parse(jsonString);
      return data;
    } catch (error) {
      console.error("Invalid JSON:", error);
      return {}; // Return default
    }
  }

  /**
   * Finally - always runs, even on error
   * Use for cleanup: close file, release resource, etc.
   */
  readAndClose(data: string) {
    let file = null;

    try {
      file = "opened";
      console.log("Processing: " + data);

      if (!data) {
        throw new Error("No data provided");
      }
    } catch (error) {
      console.error("Error processing:", error);
    } finally {
      // Always runs
      if (file) {
        file = null;
        console.log("File closed");
      }
    }
  }

  /**
   * Async/await error handling
   */
  async fetchUserSafe(userId: string): Promise<{ name: string } | null> {
    try {
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null; // Return safe default
    }
  }

  /**
   * Custom errors - more specific error handling
   */
  validateAge(age: number): void {
    if (age < 0) {
      throw new Error("Age cannot be negative");
    }

    if (age > 150) {
      throw new Error("Age must be realistic");
    }
  }

  /**
   * Catch specific errors
   */
  async processUserData(userId: string): Promise<void> {
    try {
      const user = await this.fetchUserSafe(userId);

      if (!user) {
        throw new Error("User not found");
      }

      const userObj = user as unknown as { age: number };
      this.validateAge(userObj.age); // In real code, proper type
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error("Unknown error:", error);
      }
    }
  }

  /**
   * Error propagation - throw to caller
   */
  async fetchWithRetry(url: string, maxRetries: number): Promise<Response> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fetch(url);
      } catch (error) {
        if (i === maxRetries - 1) {
          // Last attempt
          throw error; // Propagate to caller
        }
        // Wait before retry
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  /**
   * Custom error class
   */
  async fetchAndValidate(
    userId: string
  ): Promise<{ name: string } | null> {
    try {
      const user = await this.fetchUserSafe(userId);

      if (!user) {
        throw new ValidationError("User data is invalid", "NOT_FOUND");
      }

      return user;
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(`Validation failed: ${error.code}`);
      }
      return null;
    }
  }
}

/**
 * Custom error class
 */
export class ValidationError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = "ValidationError";
  }
}

// ============================================================================
// TIMEOUT AND CANCELLATION
// ============================================================================

/**
 * Week 9: Handle timeouts and cancellation
 */
export class TimeoutExamples {
  /**
   * Promise with timeout
   */
  fetchWithTimeout(url: string, timeoutMs: number): Promise<Response | void> {
    return Promise.race([
      fetch(url),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeoutMs)
      ),
    ]);
  }

  /**
   * Abort controller - cancel fetch
   */
  async fetchWithAbort(url: string): Promise<Response> {
    const controller = new AbortController();

    // Cancel after 5 seconds
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return await response.json();
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("Fetch was cancelled");
      }
      throw error;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const AsyncConcepts = {
  callbacks: CallbackExamples,
  promises: PromiseExamples,
  asyncAwait: AsyncAwaitExamples,
  errorHandling: ErrorHandling,
  timeout: TimeoutExamples,
};
