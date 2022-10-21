import { StackFrame, parseFrame } from '../src';

describe('called function', () => {
    test('function name', () => {
        const parsed = parseFrame('at bar (/root/file.js:13:17)');
        expect(parsed).toMatchObject<StackFrame>({
            func: 'bar',
        });
    });

    test('type + function name', () => {
        const frame = parseFrame('at Foo.bar (/root/file.js:5:1)');
        expect(frame).toMatchObject<StackFrame>({
            func: 'bar',
            type: 'Foo',
        });
    });

    test('nested type + function name', () => {
        const frame = parseFrame('at Foo.bar.baz (/root/file.js:5:1)');
        expect(frame).toMatchObject<StackFrame>({
            type: 'Foo.bar',
            func: 'baz',
        });
    });

    test('function name + method name', () => {
        const frame = parseFrame('at bar [as baz] (/root/file.js:5:1)');
        expect(frame).toMatchObject<StackFrame>({
            func: 'bar',
            method: 'baz',
        });
    });

    test('type + function name + method name', () => {
        const frame = parseFrame('at Foo.bar [as baz] (/root/file.js:5:1)');
        expect(frame).toMatchObject<StackFrame>({
            type: 'Foo',
            func: 'bar',
            method: 'baz',
        });
    });

    test('construct call', () => {
        const frame = parseFrame('at new Constructor (/root/file.js:5:1)');
        expect(frame).toMatchObject<StackFrame>({
            ctor: true,
            func: 'Constructor',
        });
    });

    test('async function', () => {
        const frame = parseFrame('at async run (/root/file.js:5:1)');
        expect(frame).toMatchObject<StackFrame>({
            async: true,
            func: 'run',
        });
    });

    test('type + <anonymous> function name', () => {
        const frame = parseFrame('at Object.<anonymous> (/root/file.js:5:1)');
        expect(frame).toMatchObject<StackFrame>({
            func: '<anonymous>',
            type: 'Object',
        });
    });
});

describe('source location', () => {
    test('url', () => {
        const frame = parseFrame('at foo (http://localhost:8080/dir/file.js:5:11)');
        expect(frame).toEqual<StackFrame>({
            func: 'foo',
            file: 'http://localhost:8080/dir/file.js',
            line: 5,
            col: 11,
        });
    });

    test('path (unix style)', () => {
        const frame = parseFrame('at /dir/file.js:13:17');
        expect(frame).toEqual<StackFrame>({
            file: '/dir/file.js',
            line: 13,
            col: 17,
        });
    });

    test('path (windows style)', () => {
        const frame = parseFrame('at C:\\root\\file.js:13:17');
        expect(frame).toEqual<StackFrame>({
            file: 'C:\\root\\file.js',
            line: 13,
            col: 17,
        });
    });

    test('async path (windows style)', () => {
        const frame = parseFrame('at async C:\\root\\command.js:142:13');
        expect(frame).toEqual<StackFrame>({
            async: true,
            file: 'C:\\root\\command.js',
            line: 142,
            col: 13,
        });
    });

    test('node.js internal', () => {
        const frame = parseFrame('at processTicksAndRejections (node:internal/process/task_queues:96:5)');
        expect(frame).toEqual<StackFrame>({
            func: 'processTicksAndRejections',
            file: 'node:internal/process/task_queues',
            line: 96,
            col: 5,
        });
    });

    test('v8 native library', () => {
        const frame = parseFrame('at Array.0 (native)');
        expect(frame).toEqual<StackFrame>({
            type: 'Array',
            func: '0',
            native: true,
        });
    });
});

describe('eval position', () => {
    test('origin + source location', () => {
        const frame = parseFrame('at func (eval at foo (/root/proj/file.js:13:17), <anonymous>:1:30)');
        expect(frame).toEqual<StackFrame>({
            func: 'func',
            file: '<anonymous>',
            line: 1,
            col: 30,
            evalOrigin: 'foo',
            evalFile: '/root/proj/file.js',
            evalLine: 13,
            evalCol: 17,
        });
    });

    test('origin + nested eval position', () => {
        const frame = parseFrame('at func (eval at foo (eval at bar (C:\\root\\file.js:21:17)), <anonymous>:1:30)');
        expect(frame).toEqual<StackFrame>({
            func: 'func',
            file: '<anonymous>',
            line: 1,
            col: 30,
            evalOrigin: ['foo', 'bar'],
            evalFile: 'C:\\root\\file.js',
            evalLine: 21,
            evalCol: 17,
        });
    });

    test('origin + twice nested eval position', () => {
        const frame = parseFrame('at func (eval at foo (eval at bar (eval at baz (native))), <anonymous>:1:30)');
        expect(frame).toEqual<StackFrame>({
            func: 'func',
            file: '<anonymous>',
            line: 1,
            col: 30,
            evalOrigin: ['foo', 'bar', 'baz'],
            evalNative: true,
        });
    });
});