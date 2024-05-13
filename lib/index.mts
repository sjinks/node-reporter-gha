import { type TestEvent, tap } from 'node:test/reporters';
import { issueCommand } from './command.mjs';
import { getLocationInfo, isSubtestsFailedError } from './utils.mjs';

interface FailedTestInfo {
    name: string;
    file: string | undefined;
    line: number | undefined;
    column: number | undefined;
    message: string;
}

function fallbackReporter(source: AsyncGenerator<TestEvent, void>): AsyncGenerator<string, void> {
    return tap(source);
}

export default async function* ghaReporter(source: AsyncGenerator<TestEvent, void>): AsyncGenerator<string, void> {
    const failedTests: FailedTestInfo[] = [];
    const isGHA = process.env['GITHUB_ACTIONS'] === 'true';
    if (!isGHA) {
        yield* fallbackReporter(source);
        return;
    }

    for await (const event of source) {
        if (event.type === 'test:fail') {
            const { error } = event.data.details;
            if (!isSubtestsFailedError(error)) {
                const [line, column, file] = getLocationInfo(event);

                failedTests.push({
                    name: event.data.name,
                    file,
                    line,
                    column,
                    message: error.message,
                });
            }
        }
    }

    if (failedTests.length > 0) {
        yield issueCommand('group', {}, 'Test Failures');
        for (const { name: title, file, line, column: col, message } of failedTests) {
            yield issueCommand('error', { title, file, line, col }, message);
        }
        yield issueCommand('endgroup');
    }
}
