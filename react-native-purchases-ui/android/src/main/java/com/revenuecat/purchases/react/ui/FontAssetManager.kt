package com.revenuecat.purchases.react.ui

import android.content.res.AssetManager
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import com.facebook.infer.annotation.Nullsafe

@Nullsafe(Nullsafe.Mode.LOCAL)
object FontAssetManager {
    private val mFontCache: MutableMap<String, List<Font>> = hashMapOf()
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
        return mFontCache.getOrPut(fontFamilyName) {
            mutableListOf<Font>().apply {
                for (style in EXTENSIONS.indices) {
                    for (fileNameExtension in FILE_EXTENSIONS) {
                        val fileName = "fonts/$fontFamilyName${EXTENSIONS[style]}$fileNameExtension"
                        add(Font(
                            path = fileName,
                            assetManager = assetManager,
                            weight = getWeightFromExtension(style),
                            style = getStyleFromExtension(style),
                        ))
                    }
                }
            }
        }
    }
}
