import * as fs from 'fs';
import * as path from 'path';

const repoRoot = path.resolve(__dirname, '..');

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

// TypeScript inlines these unless importHelpers pulls them from tslib.
const inlineHelper =
  /var __(?:awaiter|generator|createBinding|exportStar|importDefault) =/;

describe('tslib helper imports in dist', () => {
  it('imports helpers from tslib instead of inlining them', () => {
    const emitted = read('dist/index.js');

    expect(emitted).toContain('require("tslib")');
    expect(emitted).not.toMatch(inlineHelper);
  });
});
