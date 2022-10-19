import { parse } from '../src/parse';

test('exports a parse function', () => {
    expect(typeof parse).toBe('function');
});