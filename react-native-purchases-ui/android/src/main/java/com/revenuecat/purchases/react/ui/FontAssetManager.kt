package com.revenuecat.purchases.react.ui

import android.content.res.AssetManager
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight

object FontAssetManager {
    private val fontFamilyHashMap: MutableMap<String, FontFamily> = hashMapOf()
    private val FILE_EXTENSIONS = arrayOf(".ttf", ".otf")

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

    fun getFontFamily(
        fontFamilyName: String,
        assetManager: AssetManager
    ): FontFamily {
        val cachedFontFamily = fontFamilyHashMap[fontFamilyName]
        if (cachedFontFamily == null) {
            val fontList = mutableListOf<Font>()
            for (styleExtension in FontStyleExtension.values()) {
                for (fileNameExtension in FILE_EXTENSIONS) {
                    val fileName =
                        "fonts/$fontFamilyName${styleExtension.extension}$fileNameExtension"
                    val font = Font(
                        path = fileName,
                        assetManager = assetManager,
                        weight = styleExtension.weight,
                        style = styleExtension.style,
                    )
                    fontList.add(font)
                }
            }
            val fontFamily = FontFamily(fontList)
            fontFamilyHashMap[fontFamilyName] = fontFamily
            return fontFamily
        }
        return cachedFontFamily
    }

}
