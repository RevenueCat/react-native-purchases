//
//  spmManifests.test.ts
//  react-native-purchases
//
//  Created by Antonio Pallares.
//

import * as fs from 'fs';
import * as path from 'path';

const repoRoot = path.resolve(__dirname, '..');

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const readJson = (relativePath: string): any => JSON.parse(read(relativePath));

interface SpmPackage {
  /** npm package name, which React Native's autolinker derives SwiftPM names from. */
  npmName: string;
  packageJsonPath: string;
  podspecPath: string;
  manifestPath: string;
  /** Directory the SwiftPM target and the podspec both compile. */
  sourceDir: string;
  /** The purchases-hybrid-common product this package builds against. */
  phcProduct: 'PurchasesHybridCommon' | 'PurchasesHybridCommonUI';
}

const spmPackages: SpmPackage[] = [
  {
    npmName: 'react-native-purchases',
    packageJsonPath: 'package.json',
    podspecPath: 'RNPurchases.podspec',
    manifestPath: 'Package.swift',
    sourceDir: 'ios',
    phcProduct: 'PurchasesHybridCommon',
  },
  {
    npmName: 'react-native-purchases-ui',
    packageJsonPath: 'react-native-purchases-ui/package.json',
    podspecPath: 'react-native-purchases-ui/RNPaywalls.podspec',
    manifestPath: 'react-native-purchases-ui/Package.swift',
    sourceDir: 'react-native-purchases-ui/ios',
    phcProduct: 'PurchasesHybridCommonUI',
  },
];

/**
 * React Native's SwiftPM autolinker turns the npm package name into an upper
 * camel case identifier and expects the package, product and target to use it.
 * A mismatch makes autolinking silently skip the library.
 */
const autolinkedSwiftName = (npmName: string): string =>
  npmName
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join('');

const phcVersionInPodspec = (podspec: string): string => {
  const match = podspec.match(
    /spec\.dependency\s+"PurchasesHybridCommon(?:UI)?",\s*'([^']+)'/
  );
  if (!match) {
    throw new Error('Could not find the PurchasesHybridCommon dependency in the podspec');
  }
  return match[1];
};

const phcVersionInManifest = (manifest: string): string => {
  const match = manifest.match(
    /purchases-hybrid-common",\s*exact:\s*"([^"]+)"/
  );
  if (!match) {
    throw new Error('Could not find the purchases-hybrid-common pin in Package.swift');
  }
  return match[1];
};

const excludedPathsInManifest = (manifest: string): string[] => {
  const match = manifest.match(/exclude:\s*\[([^\]]*)\]/);
  if (!match) {
    return [];
  }
  return Array.from(match[1].matchAll(/"([^"]+)"/g)).map((entry) => entry[1]);
};

const listFilesRecursively = (absoluteDir: string): string[] => {
  // `fs.readdirSync(..., { recursive: true })` needs Node 20; CI runs Node 18.
  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(absoluteDir, entry.name);
    return entry.isDirectory() ? listFilesRecursively(entryPath) : [entryPath];
  });
};

describe.each(spmPackages)('$npmName Package.swift', (spmPackage) => {
  const manifest = read(spmPackage.manifestPath);
  const podspec = read(spmPackage.podspecPath);
  const packageJson = readJson(spmPackage.packageJsonPath);

  it('pins the same purchases-hybrid-common version as the podspec', () => {
    expect(phcVersionInManifest(manifest)).toBe(phcVersionInPodspec(podspec));
  });

  it('depends on the same purchases-hybrid-common product as the podspec', () => {
    expect(manifest).toContain(
      `.product(name: "${spmPackage.phcProduct}", package: "purchases-hybrid-common")`
    );
    expect(podspec).toContain(`spec.dependency   "${spmPackage.phcProduct}"`);
  });

  it('names the package, product and target after the npm package', () => {
    const expectedName = autolinkedSwiftName(spmPackage.npmName);

    expect(manifest).toContain(`name: "${expectedName}",`);
    expect(manifest).toContain(
      `.library(name: "${expectedName}", targets: ["${expectedName}"])`
    );
    expect(packageJson.name).toBe(spmPackage.npmName);
  });

  it('builds the same directory the podspec compiles', () => {
    expect(manifest).toContain(`path: "${path.basename(spmPackage.sourceDir)}"`);
    expect(podspec).toContain('spec.source_files = "ios/**/*.{h,m,swift}"');
  });

  it('is published to npm', () => {
    expect(packageJson.files).toContain('Package.swift');
  });

  it('is rewritten by the bump_phc_version lane', () => {
    // Keeps the SwiftPM pin in sync with the podspec on every PHC bump.
    expect(read('fastlane/Fastfile')).toContain(
      `'${spmPackage.manifestPath}' => ['purchases-hybrid-common", exact: "{x}"']`
    );
  });

  describe('target sources', () => {
    const absoluteSourceDir = path.join(repoRoot, spmPackage.sourceDir);
    const excluded = excludedPathsInManifest(manifest);
    const topLevelEntries = fs
      .readdirSync(absoluteSourceDir)
      .filter((entry) => !entry.startsWith('.'));

    it('contains no Swift sources', () => {
      // SwiftPM cannot mix Swift and Objective-C in a single target, and adding
      // a Swift file here would break the SwiftPM build without breaking CocoaPods.
      const swiftFiles = listFilesRecursively(absoluteSourceDir)
        .filter((file) => file.endsWith('.swift'))
        .map((file) => path.relative(repoRoot, file));

      expect(swiftFiles).toEqual([]);
    });

    it('compiles every Objective-C source', () => {
      const compiled = topLevelEntries.filter(
        (entry) => entry.endsWith('.m') && !excluded.includes(entry)
      );
      const objcSources = topLevelEntries.filter((entry) => entry.endsWith('.m'));

      expect(objcSources.length).toBeGreaterThan(0);
      expect(compiled).toEqual(objcSources);
    });

    it('excludes everything SwiftPM would otherwise reject as an unhandled file', () => {
      const unhandled = topLevelEntries.filter(
        (entry) =>
          !entry.endsWith('.m') && !entry.endsWith('.h') && !excluded.includes(entry)
      );

      expect(unhandled).toEqual([]);
    });
  });
});

describe('purchases-hybrid-common version', () => {
  it('is the same across both Package.swift manifests', () => {
    const versions = spmPackages.map((spmPackage) =>
      phcVersionInManifest(read(spmPackage.manifestPath))
    );

    expect(new Set(versions).size).toBe(1);
  });
});
