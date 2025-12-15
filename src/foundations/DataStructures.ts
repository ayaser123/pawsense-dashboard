/**
 * Week 7-8: Data Structures and Algorithms
 * 
 * Demonstrates:
 * - Arrays and array operations
 * - Searching algorithms
 * - Sorting algorithms
 * - Stack and Queue
 * - Basic tree structure
 * - Complexity analysis (Big O)
 */

// ============================================================================
// ARRAY OPERATIONS
// ============================================================================

/**
 * Week 7: Arrays - ordered collection of elements
 * Arrays in JavaScript/TypeScript are both arrays and more
 */
export class ArrayOperations {
  /**
   * Map - transform each element
   * Time: O(n) - visit each element once
   * Space: O(n) - new array of same size
   */
  doubleNumbers(numbers: number[]): number[] {
    return numbers.map((n) => n * 2);
    // Alternative: numbers.forEach(n => console.log(n * 2));
  }

  /**
   * Filter - keep only elements matching condition
   * Time: O(n)
   * Space: O(k) where k is number of matches
   */
  getActivePets(pets: { name: string; active: boolean }[]): string[] {
    return pets.filter((p) => p.active).map((p) => p.name);
  }

  /**
   * Find - get first matching element
   * Time: O(n) - worst case
   * Space: O(1) - returns single element
   */
  findPetByName(pets: { name: string }[], target: string) {
    return pets.find((p) => p.name === target);
  }

  /**
   * Some - check if any element matches
   * Time: O(n) worst case
   * Space: O(1)
   */
  hasActivePet(pets: { active: boolean }[]): boolean {
    return pets.some((p) => p.active);
  }

  /**
   * Every - check if all elements match
   * Time: O(n) worst case
   * Space: O(1)
   */
  allHealthy(pets: { status: string }[]): boolean {
    return pets.every((p) => p.status === "healthy");
  }

  /**
   * Reduce - combine all elements into single value
   * Time: O(n)
   * Space: O(1)
   */
  sumAges(pets: { age: number }[]): number {
    return pets.reduce((sum, p) => sum + p.age, 0);
  }

  /**
   * Reduce with object accumulator
   */
  groupByStatus(
    pets: { name: string; status: string }[]
  ): Record<string, string[]> {
    return pets.reduce(
      (groups, pet) => {
        if (!groups[pet.status]) {
          groups[pet.status] = [];
        }
        groups[pet.status].push(pet.name);
        return groups;
      },
      {} as Record<string, string[]>
    );
  }

  /**
   * Flat - flatten nested arrays
   * Time: O(n * m) where m is nesting depth
   * Space: O(n * m)
   */
  flattenGroups(groups: string[][]): string[] {
    return groups.flat();
    // Or: groups.reduce((all, g) => [...all, ...g], []);
  }

  /**
   * Array.from - convert iterable to array
   */
  stringToArray(str: string): string[] {
    return Array.from(str);
  }

  /**
   * Array.fill - create array with repeated value
   */
  createArray(size: number, value: number): number[] {
    return new Array(size).fill(value);
  }
}

// ============================================================================
// SEARCHING
// ============================================================================

/**
 * Week 7: Search algorithms
 */
export class SearchAlgorithms {
  /**
   * Linear search - check each element
   * Time: O(n)
   * When to use: Unsorted array
   */
  linearSearch(arr: number[], target: number): number {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === target) {
        return i; // Found at index i
      }
    }
    return -1; // Not found
  }

  /**
   * Binary search - divide and conquer
   * Time: O(log n) - much faster!
   * Requirement: Array must be sorted
   */
  binarySearch(arr: number[], target: number): number {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (arr[mid] === target) {
        return mid; // Found
      } else if (arr[mid] < target) {
        left = mid + 1; // Search right half
      } else {
        right = mid - 1; // Search left half
      }
    }
    return -1; // Not found
  }

  /**
   * When array has 1,000,000 elements:
   * Linear: 1,000,000 comparisons worst case
   * Binary: ~20 comparisons worst case
   * Binary is 50,000x faster!
   */

  /**
   * Two-pointer technique - efficient for sorted arrays
   */
  twoSum(arr: number[], target: number): [number, number] | null {
    let left = 0;
    let right = arr.length - 1;

    while (left < right) {
      const sum = arr[left] + arr[right];

      if (sum === target) {
        return [arr[left], arr[right]];
      } else if (sum < target) {
        left++;
      } else {
        right--;
      }
    }
    return null;
  }
}

// ============================================================================
// SORTING
// ============================================================================

/**
 * Week 8: Sorting algorithms
 */
export class SortingAlgorithms {
  /**
   * Bubble sort - simple but slow
   * Time: O(n²) - nested loops
   * Space: O(1) - sort in place
   * Use: Learning only, not production
   */
  bubbleSort(arr: number[]): number[] {
    const result = [...arr];
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result.length - i - 1; j++) {
        if (result[j] > result[j + 1]) {
          // Swap
          [result[j], result[j + 1]] = [result[j + 1], result[j]];
        }
      }
    }
    return result;
  }

  /**
   * Insertion sort - better for small arrays
   * Time: O(n²) average, O(n) best case
   * Space: O(1)
   * Use: Small arrays, nearly sorted data
   */
  insertionSort(arr: number[]): number[] {
    const result = [...arr];
    for (let i = 1; i < result.length; i++) {
      const key = result[i];
      let j = i - 1;

      while (j >= 0 && result[j] > key) {
        result[j + 1] = result[j];
        j--;
      }
      result[j + 1] = key;
    }
    return result;
  }

  /**
   * Merge sort - divide and conquer
   * Time: O(n log n) - consistent and fast
   * Space: O(n) - needs extra space
   * Use: Production code, large arrays
   */
  mergeSort(arr: number[]): number[] {
    if (arr.length <= 1) {
      return arr;
    }

    const mid = Math.floor(arr.length / 2);
    const left = this.mergeSort(arr.slice(0, mid));
    const right = this.mergeSort(arr.slice(mid));

    return this.merge(left, right);
  }

  private merge(left: number[], right: number[]): number[] {
    const result: number[] = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        result.push(left[i]);
        i++;
      } else {
        result.push(right[j]);
        j++;
      }
    }

    return result.concat(left.slice(i)).concat(right.slice(j));
  }

  /**
   * Quick sort - fast average case
   * Time: O(n log n) average, O(n²) worst case
   * Space: O(log n) - call stack
   * Use: Production, when average case matters
   */
  quickSort(arr: number[]): number[] {
    if (arr.length <= 1) {
      return arr;
    }

    const pivot = arr[0];
    const left = arr.slice(1).filter((n) => n <= pivot);
    const right = arr.slice(1).filter((n) => n > pivot);

    return [
      ...this.quickSort(left),
      pivot,
      ...this.quickSort(right),
    ];
  }

  /**
   * When n = 1,000,000 items:
   * Bubble: ~1 trillion operations (too slow!)
   * Merge: ~20 million operations (good)
   * Quick: ~20 million average (best)
   */

  /**
   * Just use built-in sort for production!
   */
  sort(arr: number[]): number[] {
    return [...arr].sort((a, b) => a - b);
  }
}

// ============================================================================
// STACK (Last In First Out)
// ============================================================================

/**
 * Week 8: Stack - LIFO data structure
 * Use: Function call stack, undo/redo, parsing
 */
export class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  /**
   * Example: Undo/Redo functionality
   */
  clear(): void {
    this.items = [];
  }
}

/**
 * Practical: Undo stack
 */
export class UndoRedo {
  private undoStack: Stack<string> = new Stack();
  private redoStack: Stack<string> = new Stack();
  private currentState: string = "";

  doAction(action: string): void {
    this.undoStack.push(this.currentState);
    this.currentState = action;
    this.redoStack.clear();
  }

  undo(): void {
    const previous = this.undoStack.pop();
    if (previous !== undefined) {
      this.redoStack.push(this.currentState);
      this.currentState = previous;
    }
  }

  redo(): void {
    const next = this.redoStack.pop();
    if (next !== undefined) {
      this.undoStack.push(this.currentState);
      this.currentState = next;
    }
  }
}

// ============================================================================
// QUEUE (First In First Out)
// ============================================================================

/**
 * Week 8: Queue - FIFO data structure
 * Use: Job queue, print queue, breadth-first search
 */
export class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }
}

/**
 * Practical: Task queue
 */
export class TaskQueue {
  private queue: Queue<{ id: string; task: string }> = new Queue();

  addTask(id: string, task: string): void {
    this.queue.enqueue({ id, task });
  }

  processNext(): { id: string; task: string } | undefined {
    return this.queue.dequeue();
  }

  getQueueSize(): number {
    return this.queue.size();
  }
}

// ============================================================================
// SIMPLE TREE
// ============================================================================

/**
 * Week 8: Tree - hierarchical data
 */
export class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

/**
 * Binary Search Tree
 */
export class BinarySearchTree {
  root: TreeNode<number> | null = null;

  insert(value: number): void {
    if (this.root === null) {
      this.root = new TreeNode(value);
    } else {
      this.insertNode(this.root, value);
    }
  }

  private insertNode(node: TreeNode<number>, value: number): void {
    if (value < node.value) {
      if (node.left === null) {
        node.left = new TreeNode(value);
      } else {
        this.insertNode(node.left, value);
      }
    } else {
      if (node.right === null) {
        node.right = new TreeNode(value);
      } else {
        this.insertNode(node.right, value);
      }
    }
  }

  /**
   * In-order traversal: left, root, right
   * For BST: returns sorted order
   */
  inOrder(node: TreeNode<number> | null = this.root): number[] {
    if (node === null) return [];
    return [
      ...this.inOrder(node.left),
      node.value,
      ...this.inOrder(node.right),
    ];
  }

  /**
   * Pre-order traversal: root, left, right
   * Use: Copy tree, prefix notation
   */
  preOrder(node: TreeNode<number> | null = this.root): number[] {
    if (node === null) return [];
    return [
      node.value,
      ...this.preOrder(node.left),
      ...this.preOrder(node.right),
    ];
  }

  /**
   * Post-order traversal: left, right, root
   * Use: Delete tree, postfix notation
   */
  postOrder(node: TreeNode<number> | null = this.root): number[] {
    if (node === null) return [];
    return [
      ...this.postOrder(node.left),
      ...this.postOrder(node.right),
      node.value,
    ];
  }

  /**
   * Search - find value in BST
   * Time: O(log n) average, O(n) worst case
   */
  search(target: number, node: TreeNode<number> | null = this.root): boolean {
    if (node === null) return false;

    if (target === node.value) {
      return true;
    } else if (target < node.value) {
      return this.search(target, node.left);
    } else {
      return this.search(target, node.right);
    }
  }
}

// ============================================================================
// BIG O NOTATION
// ============================================================================

/**
 * Week 8: Complexity analysis
 * 
 * O(1) - Constant: accessing array by index
 * O(log n) - Logarithmic: binary search
 * O(n) - Linear: simple loop
 * O(n log n) - Linearithmic: merge sort, quick sort
 * O(n²) - Quadratic: nested loops (bubble sort)
 * O(n³) - Cubic: triple nested loops
 * O(2ⁿ) - Exponential: recursive fibonacci
 * O(n!) - Factorial: permutations
 * 
 * For n = 1,000,000:
 * O(1): 1 operation
 * O(log n): ~20 operations
 * O(n): 1,000,000 operations
 * O(n log n): ~20,000,000 operations
 * O(n²): 1,000,000,000,000 operations (too slow!)
 * O(2ⁿ): 2^1000000 (impossible!)
 */

export class Fibonacci {
  /**
   * Recursive - exponential O(2ⁿ)
   * Very slow!
   */
  slowFib(n: number): number {
    if (n <= 1) return n;
    return this.slowFib(n - 1) + this.slowFib(n - 2);
  }

  /**
   * Memoization - O(n)
   * Much faster!
   */
  fastFib(n: number, memo: Record<number, number> = {}): number {
    if (n in memo) return memo[n];
    if (n <= 1) return n;

    memo[n] = this.fastFib(n - 1, memo) + this.fastFib(n - 2, memo);
    return memo[n];
  }

  /**
   * fib(5) with slowFib: ~15 recursive calls
   * fib(50) with slowFib: ~40 billion calls (too slow!)
   * fib(50) with fastFib: 50 calls (instant!)
   */
}

// ============================================================================
// EXPORTS
// ============================================================================

export const DataStructuresConcepts = {
  arrays: ArrayOperations,
  searching: SearchAlgorithms,
  sorting: SortingAlgorithms,
  stack: Stack,
  queue: Queue,
  tree: BinarySearchTree,
};
