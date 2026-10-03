// Created by Antonio Pallares. Copyright (c) 2026 RevenueCat, Inc.
package com.revenuecat.automatedsdktests

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
  override fun getMainComponentName(): String = "MaestroTestApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      object : DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled) {
        override fun getLaunchOptions(): Bundle? {
          val userID = this@MainActivity.intent?.getStringExtra("app_user_id_to_log_in") ?: return null
          return Bundle().apply { putString("app_user_id_to_log_in", userID) }
        }
      }
}
