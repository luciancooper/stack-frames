import { parseFrames, hasFrames } from '../src';

const catchError = (message = 'Error Thrown') => {
    try {
        throw new Error(message);
    } catch (error) {
        return error as Error;
    }
};

describe('parseFrames', () => {
    test('parses stack strings', () => {
        const frames = parseFrames(catchError().stack);
        expect(frames).not.toHaveLength(0);
    });

    test('parses error objects', () => {
        const frames = parseFrames(catchError());
        expect(frames).not.toHaveLength(0);
    });

    test('handles bad input', () => {
        expect(parseFrames()).toHaveLength(0);
        expect(parseFrames(catchError().message)).toHaveLength(0);
    });
});

describe('hasFrames', () => {
    test('matches strings that contain stack frames', () => {
        const err = catchError();
        expect(hasFrames(err.stack!)).toBe(true);
        expect(hasFrames(err.message)).toBe(false);
    });
});