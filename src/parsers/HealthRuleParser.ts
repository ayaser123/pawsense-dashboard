/**
 * Week 13-14: Grammars and Parser Generators
 * Defines a simple grammar for pet health rules
 * Implements a recursive descent parser for DSL
 * 
 * Grammar (BNF):
 * Rule := Condition ("AND" | "OR") Condition
 *      | Condition
 * Condition := Metric Operator Value
 * Metric := "age" | "energy" | "mood" | "activity"
 * Operator := ">" | "<" | "==" | "!=" | "contains"
 * Value := NUMBER | STRING
 */

/**
 * Abstract Syntax Tree (AST) nodes
 * Traversing the Parse Tree (Week 14)
 */

export interface ASTNode {
  type: string;
}

export interface ConditionNode extends ASTNode {
  type: "condition";
  metric: string;
  operator: string;
  value: string | number;
}

export interface BinaryOpNode extends ASTNode {
  type: "binaryOp";
  operator: "AND" | "OR";
  left: ConditionNode | BinaryOpNode;
  right: ConditionNode | BinaryOpNode;
}

export type RuleNode = ConditionNode | BinaryOpNode;

/**
 * Lexer: Tokenizes input string
 * Handles handling errors (Week 14)
 */
export interface Token {
  type: string;
  value: string;
  position: number;
}

export class Lexer {
  private input: string;
  private position: number;
  private tokens: Token[];

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.tokens = [];
  }

  /**
   * Tokenize input string
   * Precondition: input is non-empty
   * Postcondition: Returns array of valid tokens or throws error
   */
  tokenize(): Token[] {
    while (this.position < this.input.length) {
      this.skipWhitespace();

      if (this.position >= this.input.length) break;

      const char = this.input[this.position];

      // Handle strings (quoted values)
      if (char === '"' || char === "'") {
        this.tokens.push(this.readString());
      }
      // Handle numbers
      else if (this.isDigit(char)) {
        this.tokens.push(this.readNumber());
      }
      // Handle identifiers and keywords
      else if (this.isLetter(char)) {
        this.tokens.push(this.readIdentifier());
      }
      // Handle operators
      else if (char === ">" || char === "<" || char === "=" || char === "!") {
        this.tokens.push(this.readOperator());
      }
      // Handle parentheses
      else if (char === "(" || char === ")") {
        this.tokens.push({
          type: char === "(" ? "LPAREN" : "RPAREN",
          value: char,
          position: this.position,
        });
        this.position++;
      } else {
        throw new Error(`Lexer error at position ${this.position}: unexpected character '${char}'`);
      }
    }

    this.tokens.push({
      type: "EOF",
      value: "",
      position: this.position,
    });

    return this.tokens;
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
      this.position++;
    }
  }

  private readString(): Token {
    const quote = this.input[this.position];
    const startPos = this.position;
    this.position++; // Skip opening quote

    let value = "";
    while (this.position < this.input.length && this.input[this.position] !== quote) {
      value += this.input[this.position];
      this.position++;
    }

    if (this.position >= this.input.length) {
      throw new Error(`Lexer error: unterminated string at position ${startPos}`);
    }

    this.position++; // Skip closing quote
    return { type: "STRING", value, position: startPos };
  }

  private readNumber(): Token {
    const startPos = this.position;
    let value = "";

    while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
      value += this.input[this.position];
      this.position++;
    }

    // Handle decimals
    if (this.input[this.position] === ".") {
      value += ".";
      this.position++;
      while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
        value += this.input[this.position];
        this.position++;
      }
    }

    return { type: "NUMBER", value, position: startPos };
  }

  private readIdentifier(): Token {
    const startPos = this.position;
    let value = "";

    while (this.position < this.input.length && (this.isLetter(this.input[this.position]) || this.isDigit(this.input[this.position]))) {
      value += this.input[this.position];
      this.position++;
    }

    // Check for keywords
    const keywords = ["AND", "OR", "age", "energy", "mood", "activity"];
    const type = keywords.includes(value) ? "KEYWORD" : "IDENTIFIER";

    return { type, value, position: startPos };
  }

  private readOperator(): Token {
    const startPos = this.position;
    let value = this.input[this.position];
    this.position++;

    // Check for two-character operators
    if (this.position < this.input.length) {
      const nextChar = this.input[this.position];
      if ((value === "=" || value === "!" || value === "<" || value === ">") && nextChar === "=") {
        value += nextChar;
        this.position++;
      } else if (value === ">" && nextChar === ">") {
        // Handle >> if needed
        value += nextChar;
        this.position++;
      }
    }

    return { type: "OPERATOR", value, position: startPos };
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isLetter(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }
}

/**
 * Parser: Recursive descent parser for rule DSL
 * Constructs an abstract Syntax Tree (AST)
 * Implements proper error handling (Week 14)
 */
export class Parser {
  private tokens: Token[];
  private currentPos: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.currentPos = 0;
  }

  /**
   * Parse tokens into AST
   * Precondition: tokens must be valid
   * Postcondition: Returns valid RuleNode or throws parse error
   */
  parse(): RuleNode {
    const result = this.parseRule();
    if (!this.isAtEnd()) {
      throw new Error(`Parse error: unexpected tokens at position ${this.currentPos}`);
    }
    return result;
  }

  /**
   * Rule := Condition (("AND" | "OR") Condition)*
   * Left-associative
   */
  private parseRule(): RuleNode {
    let left: RuleNode = this.parseCondition();

    while (!this.isAtEnd() && (this.peekValue() === "AND" || this.peekValue() === "OR")) {
      const operator = this.advance().value as "AND" | "OR";
      const right = this.parseCondition();
      left = {
        type: "binaryOp",
        operator,
        left,
        right,
      } as BinaryOpNode;
    }

    return left;
  }

  /**
   * Condition := Metric Operator Value
   */
  private parseCondition(): ConditionNode {
    const metric = this.expectKeyword(["age", "energy", "mood", "activity"]);
    const operator = this.expectOperator();
    const value = this.parseValue();

    return {
      type: "condition",
      metric,
      operator,
      value,
    };
  }

  /**
   * Value := NUMBER | STRING
   */
  private parseValue(): string | number {
    if (this.peek().type === "NUMBER") {
      return parseFloat(this.advance().value);
    }
    if (this.peek().type === "STRING") {
      return this.advance().value;
    }
    throw new Error(`Parse error at position ${this.currentPos}: expected value`);
  }

  private expectKeyword(keywords: string[]): string {
    const token = this.peek();
    if (token.type !== "KEYWORD" || !keywords.includes(token.value)) {
      throw new Error(
        `Parse error at position ${token.position}: expected one of [${keywords.join(", ")}], got '${token.value}'`
      );
    }
    return this.advance().value;
  }

  private expectOperator(): string {
    const token = this.peek();
    if (token.type !== "OPERATOR" && token.value !== "contains") {
      throw new Error(
        `Parse error at position ${token.position}: expected operator, got '${token.value}'`
      );
    }
    return this.advance().value;
  }

  private peek(): Token {
    return this.tokens[this.currentPos];
  }

  private peekValue(): string {
    return this.peek().value;
  }

  private advance(): Token {
    return this.tokens[this.currentPos++];
  }

  private isAtEnd(): boolean {
    return this.peek().type === "EOF";
  }
}

/**
 * Evaluator: Traverses AST and evaluates rules
 * Demonstrates traversing the parse tree (Week 14)
 */
export interface EvaluationContext {
  age?: number;
  energy?: string;
  mood?: string;
  activity?: string;
  [key: string]: unknown;
}

export class Evaluator {
  /**
   * Evaluate AST node against context
   * Recursively evaluates binary operations and conditions
   */
  static evaluate(node: RuleNode, context: EvaluationContext): boolean {
    if (node.type === "condition") {
      return this.evaluateCondition(node, context);
    }

    if (node.type === "binaryOp") {
      const binaryNode = node as BinaryOpNode;
      const leftResult = this.evaluate(binaryNode.left, context);
      const rightResult = this.evaluate(binaryNode.right, context);

      if (binaryNode.operator === "AND") {
        return leftResult && rightResult;
      } else {
        // OR
        return leftResult || rightResult;
      }
    }

    return false;
  }

  private static evaluateCondition(condition: ConditionNode, context: EvaluationContext): boolean {
    const metricValue = context[condition.metric];
    const expectedValue = condition.value;

    switch (condition.operator) {
      case ">":
        return typeof metricValue === "number" && metricValue > (expectedValue as number);
      case "<":
        return typeof metricValue === "number" && metricValue < (expectedValue as number);
      case "==":
        return metricValue === expectedValue;
      case "!=":
        return metricValue !== expectedValue;
      case "contains":
        return typeof metricValue === "string" && metricValue.includes(expectedValue as string);
      default:
        return false;
    }
  }
}

/**
 * Factory function: Parse rule string to AST
 * Complete pipeline: Lexer -> Parser -> AST
 */
export function parseHealthRule(ruleString: string): RuleNode {
  const lexer = new Lexer(ruleString);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

/**
 * Factory function: Parse and evaluate rule
 */
export function evaluateHealthRule(ruleString: string, context: EvaluationContext): boolean {
  const ast = parseHealthRule(ruleString);
  return Evaluator.evaluate(ast, context);
}
