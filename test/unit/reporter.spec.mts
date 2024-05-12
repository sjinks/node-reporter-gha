import { deepEqual } from 'node:assert/strict';
import { EOL } from 'node:os';
import { after, before, describe, test } from 'node:test';
import type { TestEvent } from 'node:test/reporters';
import ghaReporter from '../../lib/index.mjs';

const queue: TestEvent[] = [
    {
        type: 'test:enqueue',
        data: {
            nesting: 0,
            name: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:dequeue',
        data: {
            nesting: 0,
            name: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:enqueue',
        data: {
            nesting: 0,
            name: 'Sample test suite',
            line: 2,
            column: 137,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:dequeue',
        data: {
            nesting: 0,
            name: 'Sample test suite',
            line: 2,
            column: 137,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:enqueue',
        data: {
            nesting: 1,
            name: 'will generate a report entry on failure',
            line: 2,
            column: 196,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:dequeue',
        data: {
            nesting: 1,
            name: 'will generate a report entry on failure',
            line: 2,
            column: 196,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:enqueue',
        data: {
            nesting: 1,
            name: 'will not generate anything',
            line: 2,
            column: 332,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:start',
        data: {
            nesting: 0,
            name: 'Sample test suite',
            line: 2,
            column: 137,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:start',
        data: {
            nesting: 1,
            name: 'will generate a report entry on failure',
            line: 2,
            column: 196,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:fail',
        data: {
            name: 'will generate a report entry on failure',
            nesting: 1,
            testNumber: 1,
            details: { duration_ms: 0.941569, error: new Error('Expected 2 to equal 1') },
            line: 2,
            column: 196,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:dequeue',
        data: {
            nesting: 1,
            name: 'will not generate anything',
            line: 2,
            column: 332,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:start',
        data: {
            nesting: 1,
            name: 'will not generate anything',
            line: 2,
            column: 332,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:pass',
        data: {
            name: 'will not generate anything',
            nesting: 1,
            testNumber: 2,
            details: { duration_ms: 0.061167 },
            line: 2,
            column: 332,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:plan',
        data: {
            nesting: 1,
            count: 2,
            line: 2,
            column: 137,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:fail',
        data: {
            name: 'Sample test suite',
            nesting: 0,
            testNumber: 1,
            details: { duration_ms: 1.663874, type: 'suite', error: new Error('1 subtest failed') },
            line: 2,
            column: 137,
            file: 'node-reporter-gha/test/integration/test.ts',
        },
    },
    {
        type: 'test:plan',
        data: { nesting: 0, count: 1 },
    },
    {
        type: 'test:diagnostic',
        data: { nesting: 0, message: 'tests 2' },
    },
    {
        type: 'test:diagnostic',
        data: { nesting: 0, message: 'suites 1' },
    },
    {
        type: 'test:diagnostic',
        data: { nesting: 0, message: 'pass 1' },
    },
    {
        type: 'test:diagnostic',
        data: { nesting: 0, message: 'fail 1' },
    },
    {
        type: 'test:diagnostic',
        data: { nesting: 0, message: 'cancelled 0' },
    },
    {
        type: 'test:diagnostic',
        data: { nesting: 0, message: 'skipped 0' },
    },
    {
        type: 'test:diagnostic',
        data: { nesting: 0, message: 'todo 0' },
    },
    {
        type: 'test:diagnostic',
        data: {
            nesting: 0,
            message: 'duration_ms 86.117666',
        },
    },
];

function* generator(): Generator<TestEvent> {
    for (const event of queue) {
        yield event;
    }
}

await describe('reporter', async () => {
    let env: typeof process.env;

    before(() => {
        env = { ...process.env };
        process.env['GITHUB_ACTIONS'] = 'true';
    });

    after(() => {
        process.env = env;
    });

    await test('will produce a report', async () => {
        const expected = [
            `::group::Test Failures${EOL}`,
            `::error title=will generate a report entry on failure,file=node-reporter-gha/test/integration/test.ts,line=2,col=196::Expected 2 to equal 1${EOL}`,
            `::error title=Sample test suite,file=node-reporter-gha/test/integration/test.ts,line=2,col=137::1 subtest failed${EOL}`,
            `::endgroup::${EOL}`,
        ];

        const actual: string[] = [];
        for await (const line of ghaReporter(generator())) {
            actual.push(line);
        }

        deepEqual(actual, expected);
    });
});
