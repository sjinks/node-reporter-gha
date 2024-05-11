import type { TestEvent } from 'node:test/reporters';
import { issueCommand } from './command';

interface FailedTestInfo {
    name: string;
    file: string | undefined;
    line: number | undefined;
    column: number | undefined;
    message: string;
}

export = async function* ghaReporter(
    source: AsyncGenerator<TestEvent, void> | Generator<TestEvent, void>,
): AsyncGenerator<string, void> {
    const failedTests: FailedTestInfo[] = [];

    for await (const event of source) {
        if (event.type === 'test:fail') {
            failedTests.push({
                name: event.data.name,
                file: event.data.file,
                line: event.data.line,
                column: event.data.column,
                message: event.data.details.error.message,
            });
        }
    }

    if (failedTests.length > 0) {
        yield issueCommand('group', {}, 'Test Failures');
        for (const { name: title, file, line, column: col, message } of failedTests) {
            yield issueCommand('error', { title, file, line, col }, message);
        }
        yield issueCommand('endgroup');
    }
};
