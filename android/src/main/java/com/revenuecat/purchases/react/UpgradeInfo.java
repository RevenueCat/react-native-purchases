package com.revenuecat.purchases.react;

class UpgradeInfo {
    private final String oldProductIdentifier;
    private final Integer prorationMode;
    private final String replacementMode;

    public UpgradeInfo(String oldProductIdentifier, Integer prorationMode, String replacementMode) {
        this.oldProductIdentifier = oldProductIdentifier;
        this.prorationMode = prorationMode;
        this.replacementMode = replacementMode;
    }

    public String getOldProductIdentifier() {
        return oldProductIdentifier;
    }

    public Integer getProrationMode() {
        return prorationMode;
    }

    public String getReplacementMode() {
        return replacementMode;
    }
}
