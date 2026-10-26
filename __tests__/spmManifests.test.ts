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

const spmPackages = [
  {
    npmName: 'react-native-purchases',
    podspecPath: 'RNPurchases.podspec',
    manifestPath: 'Package.swift',
  },
  {
    npmName: 'react-native-purchases-ui',
    podspecPath: 'react-native-purchases-ui/RNPaywalls.podspec',
    manifestPath: 'react-native-purchases-ui/Package.swift',
  },
];

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

describe.each(spmPackages)('$npmName Package.swift', (spmPackage) => {
  it('pins the same purchases-hybrid-common version as the podspec', () => {
    expect(phcVersionInManifest(read(spmPackage.manifestPath))).toBe(
      phcVersionInPodspec(read(spmPackage.podspecPath))
    );
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
