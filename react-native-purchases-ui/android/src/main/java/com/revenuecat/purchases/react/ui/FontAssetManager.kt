package com.revenuecat.purchases.react.ui

import android.content.res.AssetManager
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import com.facebook.infer.annotation.Nullsafe

@Nullsafe(Nullsafe.Mode.LOCAL)
object FontAssetManager {
    private val mFontCache: MutableMap<String?, List<Font>?> = hashMapOf()
    private val EXTENSIONS = arrayOf("", "_bold", "_italic", "_bold_italic")
    private val FILE_EXTENSIONS = arrayOf(".ttf", ".otf")

    private fun getStyleFromExtension(style: Int): FontStyle {
        return when (style) {
            2, 3 -> FontStyle.Italic
            else -> FontStyle.Normal
        }
    }

    private fun getWeightFromExtension(style: Int): FontWeight {
        return when (style) {
            1, 3 -> FontWeight.Bold
            else -> FontWeight.Normal
        }
    }

    fun getFontList(
        fontFamilyName: String,
        assetManager: AssetManager
    ): List<Font> {
        var assetFontFamily = mFontCache[fontFamilyName]
        if (assetFontFamily == null) {
            assetFontFamily = mutableListOf()
            mFontCache[fontFamilyName] = assetFontFamily
            for ((style, styleExtension) in EXTENSIONS.withIndex()) {
                for (fileNameExtension in FILE_EXTENSIONS) {
                    val fileName = "fonts/$fontFamilyName$styleExtension$fileNameExtension"
                    val font = Font(
                        path = fileName,
                        assetManager = assetManager,
                        weight = getWeightFromExtension(style),
                        style = getStyleFromExtension(style),
                    )
                    assetFontFamily.add(font)
                }
            }
        }
        return assetFontFamily
    }

}
