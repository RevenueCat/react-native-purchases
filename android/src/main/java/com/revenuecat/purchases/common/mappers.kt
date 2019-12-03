package com.revenuecat.purchases.common

import com.android.billingclient.api.SkuDetails
import com.revenuecat.purchases.EntitlementInfo
import com.revenuecat.purchases.EntitlementInfos
import com.revenuecat.purchases.Offering
import com.revenuecat.purchases.Offerings
import com.revenuecat.purchases.Package
import com.revenuecat.purchases.PurchaserInfo
import com.revenuecat.purchases.util.Iso8601Utils

fun EntitlementInfo.map(): Map<String, Any?> =
    mapOf(
        "identifier" to this.identifier,
        "isActive" to this.isActive,
        "willRenew" to this.willRenew,
        "periodType" to this.periodType.name,
        "latestPurchaseDate" to Iso8601Utils.format(this.latestPurchaseDate),
        "originalPurchaseDate" to Iso8601Utils.format(this.originalPurchaseDate),
        "expirationDate" to this.expirationDate?.let { Iso8601Utils.format(it) },
        "store" to this.store.name,
        "productIdentifier" to this.productIdentifier,
        "isSandbox" to this.isSandbox,
        "unsubscribeDetectedAt" to this.unsubscribeDetectedAt?.let { Iso8601Utils.format(it) },
        "billingIssueDetectedAt" to this.billingIssueDetectedAt?.let { Iso8601Utils.format(it) }
    )

fun EntitlementInfos.map(): Map<String, Any> =
    mapOf(
        "all" to this.all.asIterable().associate { it.key to it.value.map() },
        "active" to this.active.asIterable().associate { it.key to it.value.map() }
    )


fun SkuDetails.map(): Map<String, Any?> =
    mapOf(
        "identifier" to sku,
        "description" to description,
        "title" to title,
        "price" to priceAmountMicros / 1000000.0,
        "price_string" to price,
        "currency_code" to priceCurrencyCode
    ) + mapIntroPrice()

fun PurchaserInfo.map(): Map<String, Any?> =
    mapOf(
        "entitlements" to entitlements.map(),
        "activeSubscriptions" to activeSubscriptions.toList(),
        "allPurchasedProductIdentifiers" to allPurchasedSkus.toList(),
        "latestExpirationDate" to latestExpirationDate?.let { Iso8601Utils.format(it) },
        "firstSeen" to Iso8601Utils.format(firstSeen),
        "originalAppUserId" to originalAppUserId,
        "requestDate" to Iso8601Utils.format(requestDate),
        "allExpirationDates" to allExpirationDatesByProduct.asIterable().associate {
            it.key to it.value?.let { date -> Iso8601Utils.format(date) }
        },
        "allPurchaseDates" to allPurchaseDatesByProduct.asIterable().associate {
            it.key to it.value?.let { date -> Iso8601Utils.format(date) }
        },
        "originalApplicationVersion" to null
    )

fun Offerings.map(): Map<String, Any?> =
    mapOf(
        "all" to this.all.asIterable().associate { it.key to it.value.map() },
        "current" to this.current?.map()
    )

fun List<SkuDetails>.map(): List<Map<String, Any?>> = this.map { it.map() }

private fun Offering.map(): Map<String, Any?> =
    mapOf(
        "identifier" to identifier,
        "serverDescription" to serverDescription,
        "availablePackages" to availablePackages.map { it.map(identifier) },
        "lifetime" to lifetime?.map(identifier),
        "annual" to annual?.map(identifier),
        "sixMonth" to sixMonth?.map(identifier),
        "threeMonth" to threeMonth?.map(identifier),
        "twoMonth" to twoMonth?.map(identifier),
        "monthly" to monthly?.map(identifier),
        "weekly" to weekly?.map(identifier)
    )

private fun Package.map(offeringIdentifier: String): Map<String, Any?> =
    mapOf(
        "identifier" to identifier,
        "packageType" to packageType.name,
        "product" to product.map(),
        "offeringIdentifier" to offeringIdentifier
    )

private fun SkuDetails.mapIntroPrice(): Map<String, Any?> {
    return if (!freeTrialPeriod.isNullOrBlank()) {
        // Check freeTrialPeriod first to give priority to trials
        // Format using device locale. iOS will format using App Store locale, but there's no way
        // to figure out how the price in the SKUDetails is being formatted.
        val format = java.text.NumberFormat.getCurrencyInstance().apply {
            currency = java.util.Currency.getInstance(priceCurrencyCode)
        }
        mapOf(
            "intro_price" to 0,
            "intro_price_string" to format.format(0),
            "intro_price_period" to freeTrialPeriod,
            "intro_price_cycles" to 1
        ) + freeTrialPeriod.mapPeriod()
    } else if (!introductoryPrice.isNullOrBlank()) {
        mapOf(
            "intro_price" to introductoryPriceAmountMicros / 1000000.0,
            "intro_price_string" to introductoryPrice,
            "intro_price_period" to introductoryPricePeriod,
            "intro_price_cycles" to (introductoryPriceCycles?.takeUnless { it.isBlank() }?.toInt()
                ?: 0)
        ) + introductoryPricePeriod.mapPeriod()
    } else {
        mapOf(
            "intro_price" to null,
            "intro_price_string" to null,
            "intro_price_period" to null,
            "intro_price_cycles" to null,
            "intro_price_period_unit" to null,
            "intro_price_period_number_of_units" to null
        )
    }
}

private fun String?.mapPeriod(): Map<String, Any?> {
    return if (this.isNullOrBlank()) {
        mapOf(
            "intro_price_period_unit" to null,
            "intro_price_period_number_of_units" to null
        )
    } else {
        PurchasesPeriod.parse(this).let { period ->
            when {
                period.years > 0 -> mapOf(
                    "intro_price_period_unit" to "YEAR",
                    "intro_price_period_number_of_units" to period.years
                )
                period.months > 0 -> mapOf(
                    "intro_price_period_unit" to "MONTH",
                    "intro_price_period_number_of_units" to period.months
                )
                period.days > 0 -> mapOf(
                    "intro_price_period_unit" to "DAY",
                    "intro_price_period_number_of_units" to period.days
                )
                else -> mapOf(
                    "intro_price_period_unit" to "DAY",
                    "intro_price_period_number_of_units" to 0
                )
            }
        }
    }
}
