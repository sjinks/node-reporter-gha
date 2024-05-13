import { TestEvent } from 'node:test/reporters';

const map: Record<string, string> = {
    '\r': '%0D',
    '\n': '%0A',
    '%': '%25',
    ',': '%2C',
    ':': '%3A',
};

const replacer = (match: string): string => map[match]!;

export const escapeData = (s: unknown): string => String(s).replace(/[%\r\n]/gu, replacer);
export const escapeProperty = (s: unknown): string => String(s).replace(/[%\r\n:,]/gu, replacer);

export const transformFilename = (s: string | undefined): string | undefined =>
    // for ESM, the filename is a URL
    s?.startsWith('file://') ? new URL(s).pathname : s;

export const isSubtestsFailedError = (error: Error): boolean =>
    'code' in error &&
    'failureType' in error &&
    error.code === 'ERR_TEST_FAILURE' &&
    error.failureType === 'subtestsFailed';

export function getLocationInfo(
    event: TestEvent,
): [line: number | undefined, column: number | undefined, file: string | undefined] {
    // There is no `data` propertry in the `test:watch:drained` event
    let { line = undefined, column = undefined, file = undefined } = 'data' in event ? event.data : {};

    file = transformFilename(file);
    if (event.type === 'test:fail' && file !== undefined) {
        const { error } = event.data.details;
        if ('code' in error && error.code === 'ERR_TEST_FAILURE' && error.cause instanceof Error && error.cause.stack) {
            const stackLines = error.cause.stack.split(/\r?\n/u);
            const stackLine =
                stackLines.find((line) => line.includes(file)) ??
                stackLines.find((line) => line.includes('at TestContext.'));
            const match = stackLine?.match(/:(\d+):(\d+)\)$/u);
            if (match) {
                line = +match[1]!;
                column = +match[2]!;
            }
        }
    }

    return [line, column, file];
}

export function generateSummary(data: Record<string, string>): string {
    const lut: Record<string, string> = {
        tests: 'Total Tests',
        suites: 'Test Suites',
        pass: 'Tests Passed',
        fail: 'Tests Failed',
        cancelled: 'Tests Canceled',
        skipped: 'Test Skipped',
        todo: 'Incomplete Tests',
        duration_ms: 'Duration',
    };

    return [
        '## Test Summary',
        '',
        '<table><tbody>',
        Object.entries(data)
            .map(([key, value]) => `<tr><th align="left">${lut[key] ?? key}</th><td>${value}</td></tr>`)
            .join('\n'),
        '</tbody></table>\n',
        '',
    ].join('\n');
}
