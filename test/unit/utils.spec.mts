import { equal } from 'node:assert/strict';
import { test } from 'node:test';
import { escapeData, escapeProperty } from '../../lib/utils.mjs';

void test('utils', async (t) => {
    await t.test('escapeData', () => {
        equal(escapeData(''), '');
        equal(escapeData('Hello, World!'), 'Hello, World!');
        equal(escapeData('Hello, World 100%!\r\n'), 'Hello, World 100%25!%0D%0A');
    });

    await t.test('escapeProperty', () => {
        equal(escapeProperty(''), '');
        equal(escapeProperty('Hello, World!'), 'Hello%2C World!');
        equal(escapeProperty('Hello, World: 100%!\r\n'), 'Hello%2C World%3A 100%25!%0D%0A');
    });
});
