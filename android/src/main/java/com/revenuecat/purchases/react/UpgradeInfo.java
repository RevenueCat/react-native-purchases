package com.revenuecat.purchases.react;

class UpgradeInfo {
    private final String oldProductIdentifier;
    private final String replacementMode;

    public UpgradeInfo(String oldProductIdentifier, String replacementMode) {
        this.oldProductIdentifier = oldProductIdentifier;
        this.replacementMode = replacementMode;
    }

    public String getOldProductIdentifier() {
        return oldProductIdentifier;
    }

    public String getReplacementMode() {
        return replacementMode;
    }
}
