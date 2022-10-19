import type { StackFrame, Eval } from './types';

/**
 * Check if a string contains any stack frames
 * @param str - string to check
 */
export function isStackTrace(str: string): boolean {
    return /^\s*at (?:.*? \()?(?:eval at [^ ]+ \(.+?\), )?(?:.+?:\d+:\d+|native)\)?$/m.test(str);
}

/**
 * Check if line is a stack frame
 * @param line - line to check
 */
export function isStackFrame(line: string): boolean {
    return /^\s*at (?:.*? \()?(?:eval at [^ ]+ \(.+?\), )?(?:.+?:\d+:\d+|native)\)?$/.test(line);
}

function extractParenthesized(str: string): [string, string] {
    const j = str.lastIndexOf(')');
    let i = j - 1;
    for (let n = 1; i >= 0; i -= 1) {
        if (str[i] === ')') n += 1;
        else if (str[i] === '(') n -= 1;
        if (n === 0) break;
    }
    return i < 0 ? ['', str] : [str.slice(0, i).trim(), str.slice(i + 1, j)];
}

function splitEval(str: string): { origin: string | string[], loc: string } {
    const [origin, loc] = extractParenthesized(str);
    if (loc.startsWith('eval at')) {
        const nested = splitEval(loc.replace(/^eval at +/, ''));
        nested.origin = (typeof nested.origin === 'string') ? [origin, nested.origin] : [origin, ...nested.origin];
        return nested;
    }
    return { origin, loc };
}

function parseEval(str: string): Eval {
    const pos: Eval = splitEval(str),
        // ([1: file][2: line][3: col] | [4: native])
        match = /^(?:(.+?):(\d+):(\d+)|(native))$/.exec(pos.loc);
    if (match) {
        pos.native = !!match[4];
        if (match[1]) {
            pos.file = match[1];
            pos.line = Number(match[2]!);
            pos.col = Number(match[3]!);
        }
    }
    return pos;
}

/**
 * Parse a single stack frame line
 * @param line - stack frame string
 * @returns parsed stack frame
 */
export function parseFrame(line: string): StackFrame {
    let frame: StackFrame;
    // separate out parenthesized location
    if (/\)\s*$/.test(line)) {
        const [func, loc] = extractParenthesized(line.replace(/^\s*at */, ''));
        // initialize stack frame
        frame = { loc };
        // parse function
        const match = /^(?:(async) )?(?:(new) )?(?:((?:\S*?\.)*\S+)\.)?(\S+)(?: \[as (\S+)\])?$/.exec(func);
        if (match) {
            frame.ctor = !!match[2];
            frame.async = !!match[1];
            frame.func = match[4]!;
            if (match[3]) frame.type = match[3]!;
            if (match[5]) frame.method = match[5]!;
        } else {
            frame.func = func;
        }
    } else {
        frame = { loc: line.replace(/^\s*at */, '') };
    }
    // parse loc [1: eval?] ([2: file][3: line][4: col] | [5: native])
    const match = /^(?:eval at (\S+ \(.+?\)), )?(?:(.+?):(\d+):(\d+)|(native))$/.exec(frame.loc);
    if (match) {
        frame.native = !!match[5];
        if (match[2]) {
            frame.file = match[2];
            frame.line = Number(match[3]!);
            frame.col = Number(match[4]!);
        }
        // check for eval
        if (match[1]) {
            frame.eval = parseEval(match[1]);
        }
    }
    return frame;
}

/**
 * Extract stack frames from an error or stack trace string
 * @param error - string or error to extract stack frames from
 * @returns array of parsed stack frames
 */
export function parse(error?: string | Error): StackFrame[] {
    if (!error) return [];
    return ((typeof error === 'string') ? error : (error.stack ?? String(error)))
        .split('\n')
        .filter(isStackFrame)
        .map((l) => parseFrame(l.trim()));
}