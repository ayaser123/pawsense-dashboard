/**
 * Week 12: Recursive Data Types
 * Implements hierarchical alert tree structure
 * Demonstrates:
 * - Recursive data type definition
 * - Tree traversal patterns
 * - Recursive composition
 */

import type { AlertADT } from "./AlertADT";

/**
 * Recursive Alert Tree Node
 * Base case: Leaf node contains single alert
 * Recursive case: Branch contains child alerts (dependent or grouped)
 */
export type AlertNode = AlertLeaf | AlertBranch;

export interface AlertLeaf {
  type: "leaf";
  alert: AlertADT;
}

export interface AlertBranch {
  type: "branch";
  alert: AlertADT; // Parent alert (summary)
  children: AlertNode[]; // Dependent alerts
}

/**
 * Recursive tree structure for alert hierarchies
 * Invariant: Tree must be well-formed (no cycles, all nodes valid)
 */
export class AlertTree {
  private root: AlertNode | null;

  constructor(root?: AlertNode) {
    if (root) {
      this.validateTreeInvariant(root);
    }
    this.root = root || null;
  }

  /**
   * Recursive invariant validation
   * Checks structural integrity of entire tree
   */
  private validateTreeInvariant(node: AlertNode): void {
    if (node.type === "leaf") {
      // Base case: leaf is always valid
      return;
    }

    // Recursive case: validate all children
    if (node.type === "branch" && node.children) {
      for (const child of node.children) {
        this.validateTreeInvariant(child);
      }
    }
  }

  /**
   * Recursive structure of recursive implementations (Week 7)
   * Get all alerts in tree using depth-first traversal
   */
  getAllAlerts(): AlertADT[] {
    if (!this.root) return [];
    return this.collectAlerts(this.root);
  }

  /**
   * Recursive helper: Collect all alerts in subtree
   * Base case: leaf node contains single alert
   * Recursive case: collect alert + all alerts from children
   */
  private collectAlerts(node: AlertNode): AlertADT[] {
    if (node.type === "leaf") {
      return [node.alert];
    }

    // Recursive case: combine parent with all children's alerts
    const alerts: AlertADT[] = [node.alert];
    for (const child of node.children) {
      alerts.push(...this.collectAlerts(child));
    }
    return alerts;
  }

  /**
   * Recursive traversal: Count all alerts in tree
   * Base case: leaf has 1 alert
   * Recursive case: 1 + sum of children's counts
   */
  countAlerts(): number {
    if (!this.root) return 0;
    return this.countAlertsRecursive(this.root);
  }

  private countAlertsRecursive(node: AlertNode): number {
    if (node.type === "leaf") {
      return 1; // Base case
    }
    // Recursive case
    let count = 1;
    for (const child of node.children) {
      count += this.countAlertsRecursive(child);
    }
    return count;
  }

  /**
   * Recursive traversal: Find alert by ID
   * Base case: check if current node matches
   * Recursive case: search children if not found
   */
  findAlertById(id: string): AlertADT | null {
    if (!this.root) return null;
    return this.findRecursive(this.root, id);
  }

  private findRecursive(node: AlertNode, id: string): AlertADT | null {
    if (node.alert.getId() === id) {
      return node.alert; // Base case: found
    }

    if (node.type === "branch") {
      // Recursive case: search children
      for (const child of node.children) {
        const found = this.findRecursive(child, id);
        if (found) return found;
      }
    }

    return null; // Base case: not found
  }

  /**
   * Recursive traversal: Get alerts at specific depth level
   * Demonstrates choosing right recursive subproblem (Week 7)
   */
  getAlertsAtDepth(targetDepth: number): AlertADT[] {
    if (!this.root || targetDepth < 0) return [];
    return this.getAtDepthRecursive(this.root, 0, targetDepth);
  }

  private getAtDepthRecursive(node: AlertNode, currentDepth: number, targetDepth: number): AlertADT[] {
    if (currentDepth === targetDepth) {
      return [node.alert]; // Base case: at target depth
    }

    if (currentDepth >= targetDepth || node.type === "leaf") {
      return []; // Base cases: past target or leaf
    }

    // Recursive case: search children
    const alerts: AlertADT[] = [];
    for (const child of node.children) {
      alerts.push(...this.getAtDepthRecursive(child, currentDepth + 1, targetDepth));
    }
    return alerts;
  }

  /**
   * Recursive traversal: Get depth of tree
   * Base case: leaf has depth 0
   * Recursive case: 1 + max depth of children
   */
  getDepth(): number {
    if (!this.root) return -1;
    return this.getDepthRecursive(this.root);
  }

  private getDepthRecursive(node: AlertNode): number {
    if (node.type === "leaf") {
      return 0; // Base case
    }

    let maxChildDepth = 0;
    for (const child of node.children) {
      maxChildDepth = Math.max(maxChildDepth, this.getDepthRecursive(child));
    }
    return 1 + maxChildDepth; // Recursive case
  }

  /**
   * Recursive transformation: Map function over all alerts
   * Returns new tree with transformed alerts
   */
  mapAlerts(fn: (alert: AlertADT) => AlertADT): AlertTree {
    if (!this.root) return new AlertTree();
    return new AlertTree(this.mapRecursive(this.root, fn));
  }

  private mapRecursive(node: AlertNode, fn: (alert: AlertADT) => AlertADT): AlertNode {
    const transformedAlert = fn(node.alert);

    if (node.type === "leaf") {
      return { type: "leaf", alert: transformedAlert };
    }

    // Recursive case: transform children
    const transformedChildren = node.children.map((child) => this.mapRecursive(child, fn));

    return {
      type: "branch",
      alert: transformedAlert,
      children: transformedChildren,
    };
  }

  /**
   * Recursive filtering: Get subtree of critical alerts only
   */
  filterCritical(): AlertTree {
    if (!this.root) return new AlertTree();
    const filtered = this.filterRecursive(this.root);
    return new AlertTree(filtered || undefined);
  }

  private filterRecursive(node: AlertNode): AlertNode | null {
    const isCritical = node.alert.getSeverity() >= 7;

    if (node.type === "leaf") {
      return isCritical ? node : null; // Base case: return if critical
    }

    // Recursive case: filter children
    const filteredChildren = node.children
      .map((child) => this.filterRecursive(child))
      .filter((child): child is AlertNode => child !== null);

    if (isCritical || filteredChildren.length > 0) {
      return {
        type: "branch",
        alert: node.alert,
        children: filteredChildren,
      };
    }

    return null;
  }

  /**
   * Add alert to root or replace if exists
   */
  setRoot(alert: AlertADT): void {
    this.root = { type: "leaf", alert };
  }

  /**
   * Add child alert to parent (creates branch if needed)
   */
  addChild(parentId: string, childAlert: AlertADT): boolean {
    if (!this.root) return false;
    const parent = this.findAlertById(parentId);
    if (!parent) return false;

    // If root is currently a leaf with matching parent ID, convert to branch
    if (this.root.type === "leaf" && this.root.alert.getId() === parentId) {
      this.root = {
        type: "branch",
        alert: parent,
        children: [{ type: "leaf", alert: childAlert }],
      };
      return true;
    }

    // Otherwise, find parent in tree and add child
    return this.addChildRecursive(this.root, parentId, childAlert);
  }

  private addChildRecursive(node: AlertNode, parentId: string, childAlert: AlertADT): boolean {
    if (node.type === "branch" && node.alert.getId() === parentId) {
      node.children.push({ type: "leaf", alert: childAlert });
      return true;
    }

    if (node.type === "branch") {
      for (const child of node.children) {
        if (this.addChildRecursive(child, parentId, childAlert)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Print tree structure for debugging
   */
  toString(node?: AlertNode, depth: number = 0): string {
    const current = node || this.root;
    if (!current) return "Empty tree";

    const indent = "  ".repeat(depth);
    let result = `${indent}${current.alert.getTitle()} (severity: ${current.alert.getSeverity()})\n`;

    if (current.type === "branch") {
      for (const child of current.children) {
        result += this.toString(child, depth + 1);
      }
    }

    return result;
  }
}

/**
 * Factory function: Create leaf node
 */
export function createAlertLeaf(alert: AlertADT): AlertLeaf {
  return { type: "leaf", alert };
}

/**
 * Factory function: Create branch node with children
 */
export function createAlertBranch(alert: AlertADT, children: AlertNode[]): AlertBranch {
  return { type: "branch", alert, children };
}
