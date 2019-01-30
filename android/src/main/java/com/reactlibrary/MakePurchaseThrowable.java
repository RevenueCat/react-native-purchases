package com.reactlibrary;

import com.revenuecat.purchases.Purchases;
import com.revenuecat.purchases.PurchasesError;

public class MakePurchaseThrowable extends PurchasesThrowable {

    boolean userCancelled;

    public MakePurchaseThrowable(Purchases.ErrorDomains domain, int code, String message, boolean userCancelled) {
        super(domain, code, message);
        this.userCancelled = userCancelled;
    }

    static MakePurchaseThrowable init(PurchasesError error, boolean userCancelled) {
        return new MakePurchaseThrowable(error.getDomain(), error.getCode(), error.getMessage(), userCancelled);
    }
}
