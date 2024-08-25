import { type TestEvent } from 'node:test/reporters';
import { appendFile } from 'node:fs/promises';
import { issueCommand } from './command.mjs';
import { generateSummary, getLocationInfo, isSubtestsFailedError } from './utils.mjs';

interface FailedTestInfo {
    name: string;
    file: string | undefined;
    line: number | undefined;
    column: number | undefined;
    message: string;
}

/* c8 ignore start */
async function writeSummary(stats: Record<string, string>): Promise<void> {
    if (process.env['GITHUB_STEP_SUMMARY']) {
        const summary = generateSummary(stats);
        try {
            await appendFile(process.env['GITHUB_STEP_SUMMARY'], summary);
        } catch (error: unknown) {
            console.warn(`Failed to write summary: ${(error as Error).message}`);
        }
    }
}
/* c8 ignore stop */

function* handleEvent(
    event: TestEvent,
    failedTests: FailedTestInfo[],
    stats: Record<string, string>,
): Generator<string> {
    if (event.type === 'test:fail') {
        const {
            name,
            details: {
                error,
                error: { message },
            },
        } = event.data;

        if (!isSubtestsFailedError(error)) {
            const [line, column, file] = getLocationInfo(event);
            failedTests.push({ name, file, line, column, message });
        }
    } else if (event.type === 'test:diagnostic') {
        const [line, column, file] = getLocationInfo(event);
        const { message } = event.data;
        if (line === undefined && column === undefined && file === undefined) {
            const statsRegex = /^(tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) /u;
            if (statsRegex.test(message)) {
                const [key, value] = message.split(' ');
                stats[key!] = value!;
            }
        } else {
            yield issueCommand('notice', { file, line, col: column }, message);
        }
    }
}

function* handleFailedTests(failedTests: FailedTestInfo[]): Generator<string> {
    if (failedTests.length > 0) {
        yield issueCommand('group', {}, 'Test Failures');
        for (const { name: title, file, line, column: col, message } of failedTests) {
            yield issueCommand('error', { title, file, line, col }, message);
        }

        yield issueCommand('endgroup');
    }
}

export default async function* ghaReporter(source: AsyncGenerator<TestEvent, void>): AsyncGenerator<string, void> {
    const failedTests: FailedTestInfo[] = [];
    const stats: Record<string, string> = {};
    const isGHA = process.env['GITHUB_ACTIONS'] === 'true';
    if (!isGHA) {
        // eslint-disable-next-line sonarjs/sonar-no-unused-vars
        for await (const _ of source) {
            // drain the source
        }
    } else {
        for await (const event of source) {
            yield* handleEvent(event, failedTests, stats);
        }

        yield* handleFailedTests(failedTests);
        await writeSummary(stats);
    }
}
