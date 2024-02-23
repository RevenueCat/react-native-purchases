package com.revenuecat.purchases.react.ui

import android.content.res.AssetManager
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight


object FontAssetManager {
    private val fontFamilyHashMap: MutableMap<String, FontFamily> = hashMapOf()
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
    }

    fun getFontFamily(fontFamilyName: String, assetManager: AssetManager): FontFamily? {
        val cachedFontFamily = fontFamilyHashMap[fontFamilyName]
        if (cachedFontFamily != null) {
            return cachedFontFamily
        }

        val fontList = mutableListOf<Font>()
        FontStyleExtension.values().forEach { styleExtension ->
            FILE_EXTENSIONS.forEach { fileNameExtension ->
                val fileName = "$fontFamilyName${styleExtension.extension}$fileNameExtension"
                val mapList = assetManager.list(FONT_PATH)?.toList() ?: emptyList()
                if (mapList.contains(fileName)) {
                    fontList.add(
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

        return if (fontList.isNotEmpty()) {
            val fontFamily = FontFamily(fontList)
            fontFamilyHashMap[fontFamilyName] = fontFamily
            fontFamily
        } else {
            null
        }
    }
}
