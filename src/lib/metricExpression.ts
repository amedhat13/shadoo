// Safe expression evaluator for custom report metrics.
// Supports: numbers, metric keys, + - * / ( ), and min(), max(), avg().
// No eval / Function — a tiny recursive-descent parser, so a bad expression can
// never execute code.

export type ExprVars = Record<string, number | null>;

export interface ExprResult {
  value: number | null;
  error: string | null;
  /** Metric keys referenced by the expression. */
  refs: string[];
}

type Token = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

const FUNCS = new Set(['min', 'max', 'avg']);

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const n = Number(src.slice(i, j));
      if (Number.isNaN(n)) throw new Error(`Not a number: "${src.slice(i, j)}"`);
      tokens.push({ t: 'num', v: n });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      tokens.push({ t: 'id', v: src.slice(i, j) });
      i = j;
      continue;
    }
    if ('+-*/(),'.includes(c)) { tokens.push({ t: 'op', v: c }); i++; continue; }
    throw new Error(`"${c}" is not allowed in a formula.`);
  }
  return tokens;
}

/** Parses and evaluates. Unknown / missing metric values make the whole result null. */
export function evaluateExpression(src: string, vars: ExprVars): ExprResult {
  const refs: string[] = [];
  if (!src || !src.trim()) return { value: null, error: 'The formula is empty.', refs };

  let tokens: Token[];
  try {
    tokens = tokenize(src);
  } catch (e) {
    return { value: null, error: e instanceof Error ? e.message : 'Invalid formula.', refs };
  }

  let pos = 0;
  let missing = false;
  const peek = () => tokens[pos];
  const eat = (op: string) => {
    const tk = peek();
    if (tk && tk.t === 'op' && tk.v === op) { pos++; return true; }
    return false;
  };

  function parseExpr(): number {
    let left = parseTerm();
    for (;;) {
      if (eat('+')) left += parseTerm();
      else if (eat('-')) left -= parseTerm();
      else return left;
    }
  }

  function parseTerm(): number {
    let left = parseUnary();
    for (;;) {
      if (eat('*')) left *= parseUnary();
      else if (eat('/')) {
        const r = parseUnary();
        left = r === 0 ? 0 : left / r;
      } else return left;
    }
  }

  function parseUnary(): number {
    if (eat('-')) return -parseUnary();
    if (eat('+')) return parseUnary();
    return parseAtom();
  }

  function parseAtom(): number {
    const tk = peek();
    if (!tk) throw new Error('The formula ends too early.');
    if (tk.t === 'num') { pos++; return tk.v; }
    if (tk.t === 'op' && tk.v === '(') {
      pos++;
      const v = parseExpr();
      if (!eat(')')) throw new Error('A bracket is not closed.');
      return v;
    }
    if (tk.t === 'id') {
      pos++;
      const name = tk.v;
      if (peek() && peek().t === 'op' && (peek() as any).v === '(') {
        if (!FUNCS.has(name.toLowerCase())) throw new Error(`"${name}" is not a known function. Use min, max or avg.`);
        pos++;
        const args: number[] = [parseExpr()];
        while (eat(',')) args.push(parseExpr());
        if (!eat(')')) throw new Error('A bracket is not closed.');
        const fn = name.toLowerCase();
        if (fn === 'min') return Math.min(...args);
        if (fn === 'max') return Math.max(...args);
        return args.reduce((s, v) => s + v, 0) / args.length;
      }
      refs.push(name);
      const v = vars[name];
      if (v === undefined) throw new Error(`"${name}" is not one of your metrics.`);
      if (v === null) { missing = true; return 0; }
      return v;
    }
    throw new Error('The formula could not be read.');
  }

  try {
    const value = parseExpr();
    if (pos < tokens.length) throw new Error('There is something extra at the end of the formula.');
    if (!Number.isFinite(value)) return { value: null, error: 'The formula does not produce a number.', refs };
    if (missing) return { value: null, error: null, refs };
    return { value: Math.round(value * 100) / 100, error: null, refs };
  } catch (e) {
    return { value: null, error: e instanceof Error ? e.message : 'Invalid formula.', refs };
  }
}

/** Metric keys mentioned in an expression (best effort, ignores functions). */
export function expressionRefs(src: string): string[] {
  try {
    return tokenize(src || '')
      .filter((t): t is { t: 'id'; v: string } => t.t === 'id')
      .map(t => t.v)
      .filter(v => !FUNCS.has(v.toLowerCase()));
  } catch {
    return [];
  }
}
