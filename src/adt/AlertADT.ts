/**
 * Week 10-11: Abstract Data Type (ADT) for Alert
 * Encapsulates alert information with hierarchical structure
 * Supports recursive composition for alert chains (Week 12)
 */

import type { PetADT } from "./PetADT";

export type AlertType = "warning" | "info" | "success" | "critical";
export type AlertSource = "analysis" | "manual" | "system";

export interface AlertRepresentation {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  petId: string;
  timestamp: string;
  read: boolean;
  action?: string;
  source: AlertSource;
  severity: number; // 0-10 scale
  metadata?: Record<string, unknown>;
}

/**
 * ADT: Alert
 * Invariant: id, title, message must be non-empty
 *          type must be valid
 *          severity must be in [0, 10]
 *          timestamp must be valid ISO string
 */
export class AlertADT {
  private readonly rep: AlertRepresentation;
  private readonly pet: PetADT;

  constructor(rep: AlertRepresentation, pet: PetADT) {
    this.validateInvariant(rep);
    this.rep = { ...rep };
    this.pet = pet;
  }

  /**
   * Rep Invariant: Validates alert properties
   */
  private validateInvariant(rep: AlertRepresentation): void {
    const validTypes: AlertType[] = ["warning", "info", "success", "critical"];
    const validSources: AlertSource[] = ["analysis", "manual", "system"];

    if (!rep.id || rep.id.trim().length === 0) {
      throw new Error("Invariant violated: Alert ID cannot be empty");
    }
    if (!validTypes.includes(rep.type)) {
      throw new Error(`Invariant violated: Invalid alert type: ${rep.type}`);
    }
    if (!rep.title || rep.title.trim().length === 0) {
      throw new Error("Invariant violated: Alert title cannot be empty");
    }
    if (!rep.message || rep.message.trim().length === 0) {
      throw new Error("Invariant violated: Alert message cannot be empty");
    }
    if (rep.severity < 0 || rep.severity > 10) {
      throw new Error(`Invariant violated: Severity must be in [0, 10], got ${rep.severity}`);
    }
    if (!this.isValidTimestamp(rep.timestamp)) {
      throw new Error(`Invariant violated: Invalid timestamp format: ${rep.timestamp}`);
    }
    if (!validSources.includes(rep.source)) {
      throw new Error(`Invariant violated: Invalid source: ${rep.source}`);
    }
  }

  /**
   * Validate ISO 8601 timestamp format
   */
  private isValidTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  }

  // Public interface
  getId(): string {
    return this.rep.id;
  }

  getType(): AlertType {
    return this.rep.type;
  }

  getTitle(): string {
    return this.rep.title;
  }

  getMessage(): string {
    return this.rep.message;
  }

  getPetId(): string {
    return this.rep.petId;
  }

  getPet(): PetADT {
    return this.pet;
  }

  getTimestamp(): string {
    return this.rep.timestamp;
  }

  isRead(): boolean {
    return this.rep.read;
  }

  getAction(): string | undefined {
    return this.rep.action;
  }

  getSource(): AlertSource {
    return this.rep.source;
  }

  getSeverity(): number {
    return this.rep.severity;
  }

  getMetadata(): Record<string, unknown> | undefined {
    return this.rep.metadata;
  }

  /**
   * Postcondition: Returns new AlertADT with read status marked true
   */
  markAsRead(): AlertADT {
    return new AlertADT(
      {
        ...this.rep,
        read: true,
      },
      this.pet
    );
  }

  /**
   * Determines severity level as human-readable string
   * Encapsulates severity interpretation logic
   */
  getSeverityLevel(): "low" | "medium" | "high" | "critical" {
    if (this.rep.severity >= 8) return "critical";
    if (this.rep.severity >= 6) return "high";
    if (this.rep.severity >= 3) return "medium";
    return "low";
  }

  /**
   * Check if alert requires immediate action
   */
  requiresImmediateAction(): boolean {
    return this.rep.severity >= 7 || this.rep.type === "critical";
  }

  /**
   * Immutable update with metadata
   */
  withMetadata(metadata: Record<string, unknown>): AlertADT {
    return new AlertADT(
      {
        ...this.rep,
        metadata: { ...this.rep.metadata, ...metadata },
      },
      this.pet
    );
  }

  toRepresentation(): AlertRepresentation {
    return { ...this.rep };
  }

  equals(other: AlertADT): boolean {
    return this.rep.id === other.getId();
  }

  toString(): string {
    return `Alert(${this.rep.title}, severity=${this.rep.severity})`;
  }
}

/**
 * Factory function: Create valid AlertADT
 */
export function createAlert(data: Partial<AlertRepresentation>, pet: PetADT): AlertADT {
  if (!data.id || !data.type || !data.title || !data.message || data.severity === undefined) {
    throw new Error("Precondition failed: id, type, title, message, and severity are required");
  }
  
  const validTypes: AlertType[] = ["warning", "info", "success", "critical"];
  if (!validTypes.includes(data.type)) {
    throw new Error(`Precondition failed: Invalid alert type: ${data.type}`);
  }

  return new AlertADT(
    {
      id: data.id,
      type: data.type,
      title: data.title,
      message: data.message,
      petId: pet.getId(),
      timestamp: data.timestamp || new Date().toISOString(),
      read: data.read ?? false,
      action: data.action,
      source: data.source || "manual",
      severity: data.severity,
      metadata: data.metadata,
    },
    pet
  );
}

/**
 * Helper function: Determine severity from alert type
 */
export function getSeverityFromType(type: AlertType): number {
  const severityMap: Record<AlertType, number> = {
    info: 2,
    success: 1,
    warning: 6,
    critical: 9,
  };
  return severityMap[type];
}
