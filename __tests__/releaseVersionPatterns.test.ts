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
 * Parses one of the Fastfile's `{ 'path' => ['pattern with {x}'] }` hashes.
 *
 * The release lanes feed these to `replace_in`, which substitutes `{x}` with the
 * current version and does a literal `String#gsub`. A pattern that matches
 * nothing is silently skipped, so a typo or a renamed dependency leaves the file
 * un-bumped without failing the release.
 */
const parseFastfileHash = (hashName: string): Map<string, string[]> => {
  const fastfile = read('fastlane/Fastfile');
  const block = fastfile.match(new RegExp(`${hashName} = \\{([\\s\\S]*?)\\n\\}`));
  if (!block) {
    throw new Error(`Could not find ${hashName} in the Fastfile`);
  }

  const unescapeRuby = (value: string): string => value.replace(/\\(['\\])/g, '$1');
  const entries = new Map<string, string[]>();

  for (const line of block[1].split('\n')) {
    const entry = line.match(/^\s*'((?:[^'\\]|\\.)*)'\s*=>\s*\[(.*)\]/);
    if (!entry) {
      continue;
    }
    const patterns = Array.from(entry[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)).map((match) =>
      unescapeRuby(match[1])
    );
    entries.set(unescapeRuby(entry[1]), patterns);
  }

  return entries;
};

const unmatchedPatterns = (hashName: string, version: string): string[] => {
  const unmatched: string[] = [];

  for (const [relativePath, patterns] of parseFastfileHash(hashName)) {
    const contents = read(relativePath);
    for (const pattern of patterns) {
      const expected = pattern.split('{x}').join(version);
      if (!contents.includes(expected)) {
        unmatched.push(`${relativePath}: expected to contain \`${expected}\``);
      }
    }
  }

  return unmatched;
};

const sdkVersion = (): string => JSON.parse(read('package.json')).version;

const phcVersion = (): string => {
  const match = read('RNPurchases.podspec').match(
    /spec\.dependency\s+"PurchasesHybridCommon",\s*'([^']+)'/
  );
  if (!match) {
    throw new Error('Could not find the PurchasesHybridCommon dependency in RNPurchases.podspec');
  }
  return match[1];
};

describe('files_to_update_phc_version', () => {
  it('is not empty', () => {
    expect(parseFastfileHash('files_to_update_phc_version').size).toBeGreaterThan(0);
  });

  it('matches every file it claims to rewrite at the current version', () => {
    expect(unmatchedPatterns('files_to_update_phc_version', phcVersion())).toEqual([]);
  });
});

describe('files_with_version_number', () => {
  it('is not empty', () => {
    expect(parseFastfileHash('files_with_version_number').size).toBeGreaterThan(0);
  });

  it('matches every file it claims to rewrite at the current version', () => {
    expect(unmatchedPatterns('files_with_version_number', sdkVersion())).toEqual([]);
  });
});
