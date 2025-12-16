/**
 * LITTLE LANGUAGE FOR PET BEHAVIOR ANALYSIS
 * 
 * Grammar Definition (EBNF):
 * ```
 * program        = rule*
 * rule           = "IF" condition "THEN" assignment
 * condition      = comparison ( ("AND" | "OR") comparison )*
 * comparison     = expr ( (">" | "<" | "=" | "BETWEEN") expr )+
 * assignment     = identifier "=" value
 * expr           = identifier | number
 * value          = string | number
 * identifier     = [a-zA-Z_][a-zA-Z0-9_]*
 * string         = '"' [^"]* '"'
 * number         = [0-9]+
 * ```
 * 
 * Example Program:
 * ```
 * IF activity > 70 THEN mood = "energetic"
 * IF sleep < 6 AND stress > 50 THEN energy = "low"
 * IF heart_rate BETWEEN 100 AND 150 THEN health = "normal"
 * ```
 */

// ============================================================================
// PART 1: TOKENIZER (Lexical Analysis)
// ============================================================================

export type TokenType =
  | "IF" | "THEN" | "AND" | "OR" | "BETWEEN"
  | "IDENTIFIER" | "NUMBER" | "STRING"
  | "OPERATOR" // >, <, =
  | "LPAREN" | "RPAREN"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export class Tokenizer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(input: string) {
    this.input = input;
  }

  private peek(offset: number = 0): string {
    return this.input[this.position + offset] || "";
  }

  private advance(): string {
    const char = this.input[this.position];
    this.position++;
    if (char === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.peek())) {
      this.advance();
    }
  }

  private readKeywordOrIdentifier(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    let word = "";

    while (/[a-zA-Z0-9_]/.test(this.peek())) {
      word += this.advance();
    }

    const keywords = ["IF", "THEN", "AND", "OR", "BETWEEN"];
    const type = keywords.includes(word.toUpperCase()) 
      ? (word.toUpperCase() as TokenType)
      : "IDENTIFIER";

    return { type, value: word, line: startLine, column: startColumn };
  }

  private readNumber(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    let num = "";

    while (/\d/.test(this.peek())) {
      num += this.advance();
    }

    return { type: "NUMBER", value: num, line: startLine, column: startColumn };
  }

  private readString(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    this.advance(); // Skip opening quote
    let str = "";

    while (this.peek() !== '"' && this.peek() !== "") {
      if (this.peek() === "\\") {
        this.advance();
        str += this.advance();
      } else {
        str += this.advance();
      }
    }

    if (this.peek() === '"') {
      this.advance(); // Skip closing quote
    } else {
      throw new Error(`Unterminated string at line ${startLine}, column ${startColumn}`);
    }

    return { type: "STRING", value: str, line: startLine, column: startColumn };
  }

  tokenize(): Token[] {
    while (this.position < this.input.length) {
      this.skipWhitespace();

      if (this.position >= this.input.length) break;

      const char = this.peek();

      if (/[a-zA-Z_]/.test(char)) {
        this.tokens.push(this.readKeywordOrIdentifier());
      } else if (/\d/.test(char)) {
        this.tokens.push(this.readNumber());
      } else if (char === '"') {
        this.tokens.push(this.readString());
      } else if (char === "=") {
        this.tokens.push({
          type: "OPERATOR",
          value: this.advance(),
          line: this.line,
          column: this.column - 1,
        });
      } else if (char === ">") {
        this.tokens.push({
          type: "OPERATOR",
          value: this.advance(),
          line: this.line,
          column: this.column - 1,
        });
      } else if (char === "<") {
        this.tokens.push({
          type: "OPERATOR",
          value: this.advance(),
          line: this.line,
          column: this.column - 1,
        });
      } else if (char === "(") {
        this.tokens.push({
          type: "LPAREN",
          value: this.advance(),
          line: this.line,
          column: this.column - 1,
        });
      } else if (char === ")") {
        this.tokens.push({
          type: "RPAREN",
          value: this.advance(),
          line: this.line,
          column: this.column - 1,
        });
      } else {
        throw new Error(`Unexpected character: ${char} at line ${this.line}, column ${this.column}`);
      }
    }

    this.tokens.push({ type: "EOF", value: "", line: this.line, column: this.column });
    return this.tokens;
  }
}

// ============================================================================
// PART 2: AST NODES (Abstract Syntax Tree)
// ============================================================================

export interface ASTNode {
  type: string;
}

export interface Program extends ASTNode {
  type: "Program";
  rules: Rule[];
}

export interface Rule extends ASTNode {
  type: "Rule";
  condition: Condition;
  assignment: Assignment;
}

export interface Condition extends ASTNode {
  type: "Condition";
  operator: "AND" | "OR" | null;
  left: Comparison | Condition;
  right?: Comparison | Condition;
}

export interface Comparison extends ASTNode {
  type: "Comparison";
  operator: ">" | "<" | "=" | "BETWEEN";
  left: Expression;
  right: Expression;
  rightBound?: Expression; // For BETWEEN
}

export interface Assignment extends ASTNode {
  type: "Assignment";
  identifier: string;
  value: Value;
}

export interface Expression extends ASTNode {
  type: "Expression";
  value: string; // identifier or number
  isIdentifier: boolean;
}

export interface Value extends ASTNode {
  type: "Value";
  value: string | number;
  isString: boolean;
}

// ============================================================================
// PART 3: PARSER (Syntax Analysis)
// ============================================================================

export class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.position] || { type: "EOF", value: "", line: 0, column: 0 };
  }

  private advance(): Token {
    return this.tokens[this.position++];
  }

  private expect(type: TokenType): Token {
    const token = this.peek();
    if (token.type !== type) {
      throw new Error(
        `Expected ${type} but got ${token.type} at line ${token.line}, column ${token.column}`
      );
    }
    return this.advance();
  }

  parse(): Program {
    const rules: Rule[] = [];

    while (this.peek().type !== "EOF") {
      rules.push(this.parseRule());
    }

    return { type: "Program", rules };
  }

  private parseRule(): Rule {
    this.expect("IF");
    const condition = this.parseCondition();
    this.expect("THEN");
    const assignment = this.parseAssignment();

    return { type: "Rule", condition, assignment };
  }

  private parseCondition(): Condition {
    let left = this.parseComparison();
    let operator: "AND" | "OR" | null = null;
    let right: Comparison | Condition | undefined;

    while (this.peek().type === "AND" || this.peek().type === "OR") {
      operator = this.advance().value as "AND" | "OR";
      right = this.parseComparison();
      left = { type: "Condition", operator, left, right } as any;
    }

    if (operator === null) {
      return { type: "Condition", operator: null, left };
    }

    return left as Condition;
  }

  private parseComparison(): Comparison {
    const left = this.parseExpression();

    const operator = this.peek();
    if (operator.type !== "OPERATOR" && operator.type !== "BETWEEN") {
      throw new Error(
        `Expected comparison operator but got ${operator.type} at line ${operator.line}`
      );
    }

    let op: ">" | "<" | "=" | "BETWEEN";

    if (operator.type === "BETWEEN") {
      this.advance();
      op = "BETWEEN";
      const right = this.parseExpression();
      this.expect("AND");
      const rightBound = this.parseExpression();
      return { type: "Comparison", operator: op, left, right, rightBound };
    } else {
      op = this.advance().value as ">" | "<" | "=";
      const right = this.parseExpression();
      return { type: "Comparison", operator: op, left, right };
    }
  }

  private parseExpression(): Expression {
    const token = this.peek();

    if (token.type === "IDENTIFIER") {
      this.advance();
      return { type: "Expression", value: token.value, isIdentifier: true };
    } else if (token.type === "NUMBER") {
      this.advance();
      return { type: "Expression", value: token.value, isIdentifier: false };
    } else {
      throw new Error(
        `Expected identifier or number but got ${token.type} at line ${token.line}`
      );
    }
  }

  private parseAssignment(): Assignment {
    const identifier = this.expect("IDENTIFIER").value;
    this.expect("OPERATOR"); // =

    const token = this.peek();
    let value: Value;

    if (token.type === "STRING") {
      this.advance();
      value = { type: "Value", value: token.value, isString: true };
    } else if (token.type === "NUMBER") {
      this.advance();
      value = { type: "Value", value: parseInt(token.value), isString: false };
    } else {
      throw new Error(
        `Expected string or number in assignment but got ${token.type} at line ${token.line}`
      );
    }

    return { type: "Assignment", identifier, value };
  }
}

// ============================================================================
// PART 4: INTERPRETER/EVALUATOR (Semantic Analysis)
// ============================================================================

export interface AnalysisContext {
  [key: string]: number | string;
}

export class Interpreter {
  private program: Program;
  private context: AnalysisContext = {};

  constructor(program: Program) {
    this.program = program;
  }

  evaluate(inputContext: AnalysisContext): AnalysisContext {
    this.context = { ...inputContext };

    for (const rule of this.program.rules) {
      const conditionMet = this.evaluateCondition(rule.condition);
      if (conditionMet) {
        this.executeAssignment(rule.assignment);
      }
    }

    return this.context;
  }

  private evaluateCondition(condition: Condition): boolean {
    if (condition.operator === null) {
      const comp = condition.left as Comparison;
      return this.evaluateComparison(comp);
    }

    const leftResult = this.evaluateCondition(condition.left as any);
    const rightResult = this.evaluateCondition(condition.right as any);

    if (condition.operator === "AND") {
      return leftResult && rightResult;
    } else if (condition.operator === "OR") {
      return leftResult || rightResult;
    }

    return false;
  }

  private evaluateComparison(comparison: Comparison): boolean {
    const leftValue = this.evaluateExpression(comparison.left);
    const rightValue = this.evaluateExpression(comparison.right);

    switch (comparison.operator) {
      case ">":
        return Number(leftValue) > Number(rightValue);
      case "<":
        return Number(leftValue) < Number(rightValue);
      case "=":
        return leftValue === rightValue;
      case "BETWEEN":
        const rightBound = this.evaluateExpression(comparison.rightBound!);
        return (
          Number(leftValue) >= Number(rightValue) &&
          Number(leftValue) <= Number(rightBound)
        );
      default:
        return false;
    }
  }

  private evaluateExpression(expr: Expression): string | number {
    if (expr.isIdentifier) {
      const value = this.context[expr.value];
      if (value === undefined) {
        throw new Error(`Undefined variable: ${expr.value}`);
      }
      return value;
    } else {
      return parseInt(expr.value);
    }
  }

  private executeAssignment(assignment: Assignment): void {
    this.context[assignment.identifier] = assignment.value.value;
  }
}

// ============================================================================
// PART 5: PUBLIC API
// ============================================================================

export function compileAnalysisProgram(programText: string): Program {
  const tokenizer = new Tokenizer(programText);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

export function executeAnalysisProgram(
  program: Program,
  context: AnalysisContext
): AnalysisContext {
  const interpreter = new Interpreter(program);
  return interpreter.evaluate(context);
}

export function analyzeWithLanguage(
  programText: string,
  inputContext: AnalysisContext
): AnalysisContext {
  const program = compileAnalysisProgram(programText);
  return executeAnalysisProgram(program, inputContext);
}
