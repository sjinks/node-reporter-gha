import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

await describe('Demo Test Suite', async () => {
    await it('issue a diagnostic message', (t) => {
        equal(2 + 2, 4);
        t.diagnostic('This test should pass');
    });

    await it('this test should pass', () => {
        equal(1, 1);
    });

    await describe('Nested Test Suite', async () => {
        await it('this test should fail', () => {
            equal(1, 1);
            equal(1, 2);
        });

        await it('this test will throw', () => {
            equal(1, 1);
            throw new TypeError('This is a test error');
        });
    });

    await it('this test should be skipped', (t) => {
        t.skip();
    });

    await it('this is a todo test', (t) => {
        t.todo();
    });
});
