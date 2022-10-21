import type { StackFrame } from './types';
import { isFrame } from './regex';

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

function splitEval(str: string): [string | string[], string] {
    let [origin, loc] = extractParenthesized(str);
    if (loc.startsWith('eval at')) {
        let nested: string | string[];
        [nested, loc] = splitEval(loc.replace(/^eval at +/, ''));
        nested = (typeof nested === 'string') ? [origin, nested] : [origin, ...nested];
        return [nested, loc];
    }
    return [origin, loc];
}

/**
 * Parse a single stack frame line
 * @param line - stack frame string
 * @returns parsed stack frame
 */
export function parseFrame(line: string): StackFrame {
    // initialize stack frame
    const frame: StackFrame = {};
    // remove leading 'at '
    let loc = line.replace(/^\s*at */, '');
    // separate out parenthesized location
    if (/\)\s*$/.test(loc)) {
        let func: string;
        [func, loc] = extractParenthesized(loc);
        // parse function signature [1: async?] [2: ctor?] [3: type?] [4: func] [5: method?]
        const match = /^(?:(async) )?(?:(new) )?(?:((?:\S*?\.)*\S+)\.)?(\S+)(?: \[as (\S+)\])?$/.exec(func);
        if (match) {
            func = match[4]!;
            if (match[1]) frame.async = true;
            if (match[2]) frame.ctor = true;
            if (match[3]) frame.type = match[3]!;
            if (match[5]) frame.method = match[5]!;
        }
        frame.func = func;
    }
    // parse loc [1: eval?] ([2: file][3: line][4: col] | [5: native])
    let match = /^(?:eval at (\S+ \(.+?\)), )?(?:(.+?):(\d+):(\d+)|native)$/.exec(loc);
    if (match) {
        if (match[2]) {
            frame.file = match[2];
            frame.line = Number(match[3]!);
            frame.col = Number(match[4]!);
        } else {
            // file:line:col did not match, so must be native
            frame.native = true;
        }
        // check for eval
        if (match[1]) {
            // split eval position
            [frame.evalOrigin, loc] = splitEval(match[1]);
            // ([1: file][2: line][3: col] | [4: native])
            match = /^(?:(.+?):(\d+):(\d+)|native)$/.exec(loc);
            if (!match) {
                frame.evalLoc = loc;
            } else if (match[1]) {
                frame.evalFile = match[1];
                frame.evalLine = Number(match[2]!);
                frame.evalCol = Number(match[3]!);
            } else {
                // file:line:col did not match, so must be native
                frame.evalNative = true;
            }
        }
    } else {
        frame.loc = loc;
    }
    return frame;
}

/**
 * Extract stack frames from an error or stack trace string
 * @param error - string or error to extract stack frames from
 * @returns array of parsed stack frames
 */
export function parseFrames(error?: string | Error): StackFrame[] {
    if (!error) return [];
    return ((typeof error === 'string') ? error : (error.stack ?? String(error)))
        .split('\n')
        .filter(isFrame)
        .map((l) => parseFrame(l.trim()));
}