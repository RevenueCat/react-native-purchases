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
              val testFlow = activity?.intent?.getStringExtra("e2e_test_flow") ?: return null
              return Bundle().apply { putString("e2e_test_flow", testFlow) }
          }
      }
}
