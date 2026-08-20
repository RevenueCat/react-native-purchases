//
//  releaseVersionPatterns.test.ts
//  react-native-purchases
//
//  Created by Antonio Pallares.
//

import * as fs from 'fs';
import * as path from 'path';

const repoRoot = path.resolve(__dirname, '..');

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

/**
 * Files the release lanes list but regenerate anyway, so their patterns are
 * allowed not to match: `bump_phc_version` runs `yarn install --no-immutable`
 * right after rewriting, and whether a lockfile key carries an `@<version>`
 * alias depends on the resolution graph rather than on the bump.
 */
const generatedFiles = ['./yarn.lock'];

const versionCapture = '(\\d+\\.\\d+\\.\\d+(?:[-+][0-9A-Za-z.]+)*)';

const escapeForRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Turns a Fastfile pattern such as `packageVersion = '{x}'` into a regular
 * expression that captures whatever version the file currently holds.
 */
const patternToRegExp = (pattern: string): RegExp =>
  new RegExp(pattern.split('{x}').map(escapeForRegExp).join(versionCapture));

/**
 * Parses one of the Fastfile's `{ 'path' => ['pattern with {x}'] }` hashes.
 *
 * The lanes feed these to `replace_in`, which substitutes `{x}` and does a
 * literal `String#gsub`. A pattern matching nothing is skipped silently, so a
 * wrong pattern leaves its file un-bumped without ever failing a release.
 */
const parseFastfileHash = (hashName: string): Map<string, string[]> => {
  const fastfile = read('fastlane/Fastfile');
  const block = fastfile.match(new RegExp(`${hashName} = \\{([\\s\\S]*?)\\n\\}`));
  if (!block) {
    throw new Error(`Could not find ${hashName} in the Fastfile`);
  }

  const unescapeRuby = (value: string): string => value.replace(/\\(['\\])/g, '$1');
  const entries = new Map<string, string[]>();

  // Arrays may span several lines, so this cannot be parsed line by line.
  const entryPattern = /'((?:[^'\\]|\\.)*)'\s*=>\s*\[([\s\S]*?)\]/g;
  for (const entry of Array.from(block[1].matchAll(entryPattern))) {
    const patterns = Array.from(entry[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)).map((match) =>
      unescapeRuby(match[1])
    );
    entries.set(unescapeRuby(entry[1]), patterns);
  }

  // Guards against the parser losing coverage if the hash is ever reformatted
  // into a shape it does not understand -- the same silent skip this suite exists
  // to catch.
  const declaredKeys = (block[1].match(/^\s*'(?:[^'\\]|\\.)*'\s*=>/gm) || []).length;
  if (entries.size !== declaredKeys) {
    throw new Error(
      `Parsed ${entries.size} of ${declaredKeys} entries in ${hashName}; the parser needs updating`
    );
  }

  return entries;
};

interface PatternMatch {
  location: string;
  version: string | null;
}

const matchAllPatterns = (hashName: string): PatternMatch[] =>
  Array.from(parseFastfileHash(hashName))
    .filter(([relativePath]) => !generatedFiles.includes(relativePath))
    .flatMap(([relativePath, patterns]) => {
      const contents = read(relativePath);
      return patterns.map((pattern) => {
        const match = contents.match(patternToRegExp(pattern));
        return {
          location: `${relativePath}: ${pattern}`,
          // Every `{x}` in a pattern must resolve to the same version.
          version: match ? (new Set(match.slice(1)).size === 1 ? match[1] : 'inconsistent') : null,
        };
      });
    });

describe.each(['files_with_version_number', 'files_to_update_phc_version'])(
  '%s',
  (hashName) => {
    const matches = matchAllPatterns(hashName);

    it('covers a non-trivial number of files', () => {
      expect(matches.length).toBeGreaterThan(5);
    });

    it('has no pattern that matches nothing', () => {
      const dead = matches.filter((match) => match.version === null).map((match) => match.location);

      expect(dead).toEqual([]);
    });

    it('finds the same version everywhere', () => {
      const versions = new Map<string, string[]>();
      for (const match of matches) {
        if (match.version === null) {
          continue;
        }
        versions.set(match.version, [...(versions.get(match.version) || []), match.location]);
      }

      expect(Object.fromEntries(versions)).toEqual({
        [Array.from(versions.keys())[0]]: expect.any(Array),
      });
    });
  }
);
