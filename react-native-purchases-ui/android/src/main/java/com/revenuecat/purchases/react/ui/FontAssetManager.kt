package com.revenuecat.purchases.react.ui

import android.content.res.AssetManager
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight


internal object FontAssetManager {
    @get:Synchronized
    private var fontFamilyCache = mapOf<String, FontFamily>()
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
        val existingFontFileNames = assetManager.list(FONT_PATH)?.toList() ?: emptyList()
        val fontsInFamily = mutableListOf<Font>()
        FontStyleExtension.values().forEach { styleExtension ->
            FILE_EXTENSIONS.forEach { fileNameExtension ->
                val fileName = "$fontFamilyName${styleExtension.extension}$fileNameExtension"
                if (existingFontFileNames.contains(fileName)) {
                    fontsInFamily.add(
                        Font(
                            path = FONT_PATH + fileName,
                            assetManager = assetManager,
                            weight = styleExtension.weight,
                            style = styleExtension.style
                        )
                    )
                }
            }
        }

        return if (fontsInFamily.isNotEmpty()) {
            val fontFamily = FontFamily(fontsInFamily)
            fontFamilyCache = fontFamilyCache + (fontFamilyName to fontFamily)
            fontFamily
        } else {
            null
        }
    }
}
