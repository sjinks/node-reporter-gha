import { equal, match } from 'node:assert/strict';
import { after, before, describe, it, run } from 'node:test';
import { WritableBufferStream } from '@myrotvorets/buffer-stream';
import { dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ghaReporter from '../../lib/index.mjs';

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
    let env: typeof process.env;

    before(() => {
        env = { ...process.env };
        process.env['GITHUB_ACTIONS'] = 'true';
    });

    after(() => {
        process.env = env;
    });

    void it('will generate a report entry on failure', async () => {
        const thisDir = dirname(fileURLToPath(import.meta.url));
        const result = await runner([`${thisDir}/test${extname(fileURLToPath(import.meta.url))}`]);
        const lines = result.trim().split('\n');
        equal(lines.length, 3);
        equal(lines[0], '::group::Test Failures');
        match(
            lines[1]!,
            /^::error title=will generate a report entry on failure,file=[^,]+,line=\d+,col=\d+::Expected 2 to equal 1$/u,
        );
        equal(lines[2], '::endgroup::');
    });
});
