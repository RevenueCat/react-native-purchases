package com.revenuecat.purchases.react.ui

import android.view.View
import com.facebook.react.uimanager.UIManagerHelper

internal val View.surfaceId
    get() = UIManagerHelper.getSurfaceId(this)
