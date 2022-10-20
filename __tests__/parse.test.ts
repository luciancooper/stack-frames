import { parseFrame } from '../src';

describe('called function', () => {
    test('function name', () => {
        const parsed = parseFrame('at bar (/root/file.js:13:17)');
        expect(parsed).toMatchObject({
            async: false,
            ctor: false,
            func: 'bar',
        });
    });

    test('type + function name', () => {
        const frame = parseFrame('at Foo.bar (/root/file.js:5:1)');
        expect(frame).toMatchObject({
            async: false,
            ctor: false,
            func: 'bar',
            type: 'Foo',
        });
    });

    test('nested type + function name', () => {
        const frame = parseFrame('at Foo.bar.baz (/root/file.js:5:1)');
        expect(frame).toMatchObject({
            async: false,
            ctor: false,
            type: 'Foo.bar',
            func: 'baz',
        });
    });

    test('function name + method name', () => {
        const frame = parseFrame('at bar [as baz] (/root/file.js:5:1)');
        expect(frame).toMatchObject({
            async: false,
            ctor: false,
            func: 'bar',
            method: 'baz',
        });
    });

    test('type + function name + method name', () => {
        const frame = parseFrame('at Foo.bar [as baz] (/root/file.js:5:1)');
        expect(frame).toMatchObject({
            async: false,
            ctor: false,
            type: 'Foo',
            func: 'bar',
            method: 'baz',
        });
    });

    test('construct call', () => {
        const frame = parseFrame('at new Constructor (/root/file.js:5:1)');
        expect(frame).toMatchObject({
            async: false,
            ctor: true,
            func: 'Constructor',
        });
    });

    test('async function', () => {
        const frame = parseFrame('at async run (/root/file.js:5:1)');
        expect(frame).toMatchObject({
            async: true,
            ctor: false,
            func: 'run',
        });
    });

    test('type + <anonymous> function name', () => {
        const frame = parseFrame('at Object.<anonymous> (/root/file.js:5:1)');
        expect(frame).toMatchObject({
            async: false,
            ctor: false,
            func: '<anonymous>',
            type: 'Object',
        });
    });
});

describe('source location', () => {
    test('url', () => {
        const frame = parseFrame('at foo (http://localhost:8080/dir/file.js:5:11)');
        expect(frame).toMatchObject({
            file: 'http://localhost:8080/dir/file.js',
            line: 5,
            col: 11,
            native: false,
        });
    });

    test('path (unix style)', () => {
        const frame = parseFrame('at /dir/file.js:13:17');
        expect(frame).not.toHaveProperty('func');
        expect(frame).toMatchObject({
            file: '/dir/file.js',
            line: 13,
            col: 17,
            native: false,
        });
    });

    test('path (windows style)', () => {
        const frame = parseFrame('at C:\\root\\file.js:13:17');
        expect(frame).not.toHaveProperty('func');
        expect(frame).toMatchObject({
            file: 'C:\\root\\file.js',
            line: 13,
            col: 17,
            native: false,
        });
    });

    test('node.js internal', () => {
        const frame = parseFrame('at processTicksAndRejections (node:internal/process/task_queues:96:5)');
        expect(frame).toMatchObject({
            file: 'node:internal/process/task_queues',
            line: 96,
            col: 5,
            native: false,
        });
    });

    test('v8 native library', () => {
        const frame = parseFrame('at Array.0 (native)');
        expect(frame).toMatchObject({ native: true });
        expect(frame).not.toHaveProperty('file');
    });
});

describe('eval position', () => {
    test('origin + source location', () => {
        const frame = parseFrame('at func (eval at foo (/root/proj/file.js:13:17), <anonymous>:1:30)');
        expect(frame).toMatchObject({
            file: '<anonymous>',
            line: 1,
            col: 30,
            native: false,
            eval: {
                origin: 'foo',
                file: '/root/proj/file.js',
                line: 13,
                col: 17,
                native: false,
            },
        });
    });

    test('origin + nested eval position', () => {
        const frame = parseFrame('at func (eval at foo (eval at bar (C:\\root\\file.js:21:17)), <anonymous>:1:30)');
        expect(frame).toMatchObject({
            file: '<anonymous>',
            line: 1,
            col: 30,
            native: false,
            eval: {
                origin: ['foo', 'bar'],
                file: 'C:\\root\\file.js',
                line: 21,
                col: 17,
                native: false,
            },
        });
    });

    test('origin + twice nested eval position', () => {
        const frame = parseFrame('at func (eval at foo (eval at bar (eval at baz (native))), <anonymous>:1:30)');
        expect(frame).toMatchObject({
            file: '<anonymous>',
            line: 1,
            col: 30,
            native: false,
            eval: {
                origin: ['foo', 'bar', 'baz'],
                native: true,
            },
        });
    });
});