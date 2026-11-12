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

const phcRequirementInManifest = (manifest: string): {kind: string; value: string} => {
  const match = manifest.match(
    /purchases-hybrid-common",\s*(exact|branch):\s*"([^"]+)"/
  );
  if (!match) {
    throw new Error('Could not find the purchases-hybrid-common pin in Package.swift');
  }
  return {kind: match[1], value: match[2]};
};

describe.each(spmPackages)('$npmName Package.swift', (spmPackage) => {
  it('uses the PHC 21 development branch with the matching snapshot pod requirement', () => {
    const requirement = phcRequirementInManifest(read(spmPackage.manifestPath));
    const podVersion = phcVersionInPodspec(read(spmPackage.podspecPath));
    // TODO: remove the branch allowance before merging 12.0-dev into main; require exact pin equality. (SDK-4603)
    if (requirement.kind === 'branch') {
      expect(requirement.value).toBe('21.0-dev');
      expect(podVersion).toBe('21.0.0-SNAPSHOT');
    } else {
      expect(requirement.value).toBe(podVersion);
    }
  });
});

describe('purchases-hybrid-common version', () => {
  it('is the same across both Package.swift manifests', () => {
    const versions = spmPackages.map((spmPackage) =>
      JSON.stringify(phcRequirementInManifest(read(spmPackage.manifestPath)))
    );

    expect(new Set(versions).size).toBe(1);
  });
});
