package com.revenuecat.purchases.react.ui

import android.view.View
import androidx.compose.ui.text.font.FontFamily
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.assets.ReactFontManager
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider

internal abstract class BasePaywallViewManager<T : View> : SimpleViewManager<T>() {

    companion object PropNames {
        private const val PROP_OPTIONS = "options"
        private const val OFFERING = "offering"
        private const val IDENTIFIER = "identifier"
        private const val FONT_FAMILY = "fontFamily"
    }

    abstract fun setOfferingId(view: T, identifier: String)

    @OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
    abstract fun setFontFamily(view: T, customFontProvider: CustomFontProvider)

    @ReactProp(name = PROP_OPTIONS)
    fun setOptions(view: T, options: ReadableMap?) {
        options?.let { props ->
            setOfferingIdProp(view, props)
            setFontFamilyProp(view, props)
        }
    }

    private fun setOfferingIdProp(view: T, props: ReadableMap) {
        val offeringIdentifier = props.getDynamic(OFFERING).asMap()?.getString(IDENTIFIER)
        offeringIdentifier?.let {
            setOfferingId(view, it)
        }
    }

    @OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
    private fun setFontFamilyProp(view: T, props: ReadableMap) {
        props.getString(FONT_FAMILY)?.let {
            val typeface = ReactFontManager.getInstance()
                .getTypeface(it, ReactFontManager.TypefaceStyle.NORMAL, view.resources.assets)
            val customFontProp = CustomFontProvider(FontFamily(typeface))
            setFontFamily(view, customFontProp)
        }
    }
}

