package com.reactlibrary;

import com.revenuecat.purchases.Purchases;
import com.revenuecat.purchases.PurchasesError;

public class PurchasesThrowable extends Throwable {

    private final Purchases.ErrorDomains domain;
    private final int code;
    private final String message;

    public PurchasesThrowable(Purchases.ErrorDomains domain, int code, String message) {
        this.domain = domain;
        this.code = code;
        this.message = message;
    }

    static PurchasesThrowable init(PurchasesError error) {
        return new PurchasesThrowable(error.getDomain(), error.getCode(), error.getMessage());
    }

}
