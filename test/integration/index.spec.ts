import { equal, match } from 'node:assert/strict';
import { describe, it, run } from 'node:test';
import { WritableBufferStream } from '@myrotvorets/buffer-stream';
import ghaReporter from '../../lib';

const runner = (files: string[]): Promise<string> =>
    new Promise<string>((resolve, reject) => {
        const outStream = new WritableBufferStream();
        run({ files })
            .on('error', reject)
            .compose(ghaReporter)
            .on('end', function () {
                resolve(outStream.toString());
            })
            .pipe(outStream);
    });

void describe('GitHub Actions Reporter', () => {
    void it('will generate a report entry on failure', async () => {
        const result = await runner([`${__dirname}/test.ts`]);
        const lines = result.trim().split('\n');
        equal(lines.length, 4);
        equal(lines[0], '::group::Test Failures');
        match(
            lines[1]!,
            /^::error title=will generate a report entry on failure,file=[^,]+,line=\d+,col=\d+::Expected 2 to equal 1$/u,
        );
        match(lines[2]!, /^::error title=Sample test suite,file=[^,]+,line=\d+,col=\d+::1 subtest failed$/u);
        equal(lines[3], '::endgroup::');
    });
});
