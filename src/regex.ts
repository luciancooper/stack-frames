/**
 * Check if a string contains any stack frames
 * @param str - string to check
 */
export function hasFrames(str: string): boolean {
    return /^\s*at (?:.*? \()?(?:eval at [^ ]+ \(.+?\), )?(?:.+?:\d+:\d+|native)\)?$/m.test(str);
}

/**
 * Check if line is a stack frame
 * @param line - line to check
 */
export function isFrame(line: string): boolean {
    return /^\s*at (?:.*? \()?(?:eval at [^ ]+ \(.+?\), )?(?:.+?:\d+:\d+|native)\)?$/.test(line);
}