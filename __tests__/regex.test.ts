import { isFrame } from '../src';

describe('matches v8 stack frames', () => {
    test('only source locations', () => {
        expect(isFrame('at /dir/file.js:13:17')).toBe(true);
        expect(isFrame('at C:\\root\\file.js:13:17')).toBe(true);
        expect(isFrame('at node:internal/process/task_queues:96:5')).toBe(true);
        expect(isFrame('at native')).toBe(true);
    });

    test('call signatures and source locations', () => {
        expect(isFrame('at bar (/root/file.js:13:17)')).toBe(true);
        expect(isFrame('at Foo.bar (/root/file.js:5:1)')).toBe(true);
        expect(isFrame('at Foo.bar.baz (/root/file.js:5:1)')).toBe(true);
        expect(isFrame('at Object.<anonymous> (/root/file.js:5:1)')).toBe(true);
        expect(isFrame('at foo (http://localhost:8080/dir/file.js:5:11)')).toBe(true);
        expect(isFrame('at processTicksAndRejections (node:internal/process/task_queues:96:5)')).toBe(true);
        expect(isFrame('at Array.0 (native)')).toBe(true);
    });

    test('method name call signatures', () => {
        expect(isFrame('at bar [as baz] (/root/file.js:5:1)')).toBe(true);
        expect(isFrame('at Foo.bar [as baz] (/root/file.js:5:1)')).toBe(true);
    });

    test('construct call signatures', () => {
        expect(isFrame('at new Constructor (/root/file.js:5:1)')).toBe(true);
    });

    test('async call signatures', () => {
        expect(isFrame('at async run (/root/file.js:5:1)')).toBe(true);
        expect(isFrame('at async C:\\root\\command.js:142:13')).toBe(true);
    });

    test('eval source locations', () => {
        expect(isFrame('at func (eval at foo (/root/proj/file.js:13:17), <anonymous>:1:30)')).toBe(true);
        expect(isFrame('at func (eval at foo (eval at bar (C:\\root\\file.js:21:17)), <anonymous>:1:30)')).toBe(true);
        expect(isFrame('at func (eval at foo (eval at bar (eval at baz (native))), <anonymous>:1:30)')).toBe(true);
    });
});

describe('rejects other stack frame formats', () => {
    test('firefox style', () => {
        expect(isFrame('bar(2)@file:///G:/js/file.js:16')).toBe(false);
        expect(isFrame('foo()@file:///G:/js/file.js:20')).toBe(false);
        expect(isFrame('foo@http://path/to/file.js:41:13')).toBe(false);
        expect(isFrame('bar@http://path/to/file.js:1:1')).toBe(false);
        expect(isFrame('foo@http://localhost:8080/file.js line 26 > eval:2:96')).toBe(false);
        expect(isFrame('@http://localhost:8080/file.js line 26 > eval:4:18')).toBe(false);
    });

    test('safari style', () => {
        expect(isFrame('@http://path/to/file.js:48')).toBe(false);
        expect(isFrame('http://path/to/file.js:48:22')).toBe(false);
        expect(isFrame('foo@http://path/to/file.js:52:15')).toBe(false);
        expect(isFrame('global code@http://localhost:8080/file.js:33:18')).toBe(false);
        expect(isFrame('[native code]')).toBe(false);
        expect(isFrame('eval code')).toBe(false);
        expect(isFrame('eval@[native code]')).toBe(false);
    });
});