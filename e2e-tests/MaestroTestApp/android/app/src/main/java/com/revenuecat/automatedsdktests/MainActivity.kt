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
              return Bundle().apply {
                  this@MainActivity.intent?.getStringExtra("e2e_test_flow")?.let {
                      putString("e2e_test_flow", it)
                  }
                  this@MainActivity.intent?.getStringExtra("rc_test_api_key")?.let {
                      putString("rc_test_api_key", it)
                  }
              }
          }
      }
}
