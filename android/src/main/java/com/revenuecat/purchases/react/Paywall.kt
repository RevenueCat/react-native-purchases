package com.revenuecat.purchases.react

import android.app.PendingIntent.getActivity
import android.content.Context
import android.util.AttributeSet
import android.widget.ImageView
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.AbstractComposeView
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.uimanager.SimpleViewManager
import com.revenuecat.purchases.ui.revenuecatui.ExperimentalPreviewRevenueCatUIPurchasesAPI
import com.revenuecat.purchases.ui.revenuecatui.Paywall
import com.revenuecat.purchases.ui.revenuecatui.PaywallOptions

internal class Paywall @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : AbstractComposeView(context, attrs) {
    @OptIn(ExperimentalPreviewRevenueCatUIPurchasesAPI::class)
    @Composable
    override fun Content() {
        Paywall(
            PaywallOptions.Builder(
                dismissRequest = {}
            )
                .build()
        )
    }
}
