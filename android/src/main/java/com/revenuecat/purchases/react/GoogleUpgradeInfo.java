package com.revenuecat.purchases.react;

class GoogleUpgradeInfo {
    private final String oldProductIdentifier;
    private final Integer prorationMode;

    public GoogleUpgradeInfo(String oldProductIdentifier, Integer prorationMode) {
        this.oldProductIdentifier = oldProductIdentifier;
        this.prorationMode = prorationMode;
    }

    public String getOldProductIdentifier() {
        return oldProductIdentifier;
    }

    public Integer getProrationMode() {
        return prorationMode;
    }
}
