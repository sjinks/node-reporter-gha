import { equal } from 'node:assert/strict';
import { describe, test } from 'node:test';
import { escapeData, escapeProperty, isSubtestsFailedError, transformFilename } from '../../lib/utils.mjs';

interface TestError extends Error {
    code?: string;
    failureType?: string;
}

const createTestError = (message: string, code: string | undefined, failureType: string | undefined): TestError => {
    const result = new Error(message) as TestError;
    if (code !== undefined) {
        result.code = code;
    }

    if (failureType !== undefined) {
        result.failureType = failureType;
    }

    return result;
};

await describe('utils', async () => {
    await test('escapeData', () => {
        equal(escapeData(''), '');
        equal(escapeData('Hello, World!'), 'Hello, World!');
        equal(escapeData('Hello, World 100%!\r\n'), 'Hello, World 100%25!%0D%0A');
    });

    await test('escapeProperty', () => {
        equal(escapeProperty(''), '');
        equal(escapeProperty('Hello, World!'), 'Hello%2C World!');
        equal(escapeProperty('Hello, World: 100%!\r\n'), 'Hello%2C World%3A 100%25!%0D%0A');
    });

    await describe('transformFilename', async () => {
        await test('should process undefined', () => {
            equal(transformFilename(undefined), undefined);
        });

        await test('should process file:// URL', () => {
            equal(transformFilename('file:///path/to/file?query'), '/path/to/file');
        });

        await test('should process non-file URL', () => {
            const input = '/path/to/file';
            equal(transformFilename(input), input);
        });
    });

    await describe('isSubtestsFailedError', async () => {
        const nonTestErrors: Record<string, TestError> = {
            'Plain Error': createTestError('Plain Error', undefined, undefined),
            'No failureType': createTestError('No failureType', 'ERR_TEST_FAILURE', undefined),
            'No code': createTestError('No code', undefined, 'subtestsFailed'),
            testCodeFailure: createTestError('non-subtestsFailed', 'ERR_TEST_FAILURE', 'testCodeFailure'),
        };

        for (const [name, error] of Object.entries(nonTestErrors)) {
            // eslint-disable-next-line no-await-in-loop
            await test(`should return false for ${name}`, () => {
                equal(isSubtestsFailedError(error), false);
            });
        }

        await test('should return true for subtestsFailed', () => {
            const error = createTestError('subtestsFailed', 'ERR_TEST_FAILURE', 'subtestsFailed');
            equal(isSubtestsFailedError(error), true);
        });
    });
});
