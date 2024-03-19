package com.revenuecat.purchases.react.ui

import android.content.res.AssetManager
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.fonts.PaywallFont
import com.revenuecat.purchases.ui.revenuecatui.fonts.PaywallFontFamily


@OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
internal object FontAssetManager {
    @get:Synchronized
    private var fontFamilyCache = mapOf<String, FontFamily>()
    private var paywallFontFamilyCache = mapOf<String, PaywallFontFamily>()
    private val FILE_EXTENSIONS = arrayOf(".ttf", ".otf")

    private const val FONT_PATH = "fonts/"

    private enum class FontStyleExtension(
        val extension: String,
        val weight: FontWeight,
        val style: FontStyle
    ) {
        REGULAR("", FontWeight.Normal, FontStyle.Normal),
        BOLD("_bold", FontWeight.Bold, FontStyle.Normal),
        ITALIC("_italic", FontWeight.Normal, FontStyle.Italic),
        BOLD_ITALIC("_bold_italic", FontWeight.Bold, FontStyle.Italic);

        companion object {
            fun possibleFileNames(fontFamilyName: String) = values().flatMap { styleExtension ->
                FILE_EXTENSIONS.map { fileNameExtension ->
                    "$fontFamilyName${styleExtension.extension}$fileNameExtension"
                }
            }
        }
    }

    @Synchronized
    fun getFontFamily(fontFamilyName: String, assetManager: AssetManager): FontFamily? {
        val cachedFontFamily = fontFamilyCache[fontFamilyName]
        if (cachedFontFamily != null) {
            return cachedFontFamily
        }

        val fontsInFamily =
            getFontsInFamily(fontFamilyName, assetManager) { fileName, styleExtension ->
                Font(
                    path = FONT_PATH + fileName,
                    assetManager = assetManager,
                    weight = styleExtension.weight,
                    style = styleExtension.style
                )
            }

        return if (fontsInFamily.isNotEmpty()) {
            val fontFamily = FontFamily(fontsInFamily)
            fontFamilyCache = fontFamilyCache + (fontFamilyName to fontFamily)
            fontFamily
        } else {
            null
        }
    }

    @Synchronized
    fun getPaywallFontFamily(
        fontFamilyName: String,
        assetManager: AssetManager
    ): PaywallFontFamily? {
        val cachedPaywallFontFamily = paywallFontFamilyCache[fontFamilyName]
        if (cachedPaywallFontFamily != null) {
            return cachedPaywallFontFamily
        }

        val paywallFontsInFamily =
            getFontsInFamily(fontFamilyName, assetManager) { fileName, styleExtension ->
                PaywallFont.AssetFont(
                    path = FONT_PATH + fileName,
                    fontWeight = styleExtension.weight,
                    fontStyle = styleExtension.style.value
                )
            }

        return if (paywallFontsInFamily.isNotEmpty()) {
            val fontFamily = PaywallFontFamily(paywallFontsInFamily)
            paywallFontFamilyCache = paywallFontFamilyCache + (fontFamilyName to fontFamily)
            fontFamily
        } else {
            null
        }
    }

    private fun <T> getFontsInFamily(
        fontFamilyName: String,
        assetManager: AssetManager,
        createFont: (String, FontStyleExtension) -> T
    ): List<T> {
        val existingFontFileNames = assetManager.list(FONT_PATH)?.toList() ?: emptyList()
        val fontsInFamily = mutableListOf<T>()
        FontStyleExtension.values().forEach { styleExtension ->
            FILE_EXTENSIONS.forEach { fileNameExtension ->
                val fileName = "$fontFamilyName${styleExtension.extension}$fileNameExtension"
                if (existingFontFileNames.contains(fileName)) {
                    fontsInFamily.add(createFont(fileName, styleExtension))
                }
            }
        }
        return fontsInFamily
    }
}
