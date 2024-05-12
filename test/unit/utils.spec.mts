import { equal } from 'node:assert/strict';
import { describe, test } from 'node:test';
import { escapeData, escapeProperty, transformFilename } from '../../lib/utils.mjs';

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
});
