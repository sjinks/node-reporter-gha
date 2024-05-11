import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

void describe('Sample test suite', function () {
    void it('will generate a report entry on failure', function () {
        equal(2, 1, 'Expected 2 to equal 1');
    });

    void it('will not generate anything', function () {
        equal(2, 2, 'Expected 2 to equal 2');
    });
});
