package com.revenuecat.purchases.react.ui

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.revenuecat.purchases.react.ui.views.WrappedPaywallComposeView
import com.revenuecat.purchases.ui.revenuecatui.PaywallListener
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider

class PaywallFragment : Fragment() {
    
    companion object {
        const val TAG = "PaywallFragment"
    }
    
    private var paywallView: WrappedPaywallComposeView? = null
    private var paywallListener: PaywallListener? = null
    private var dismissHandler: (() -> Unit)? = null
    private var offeringId: String? = null
    private var fontProvider: CustomFontProvider? = null
    private var displayDismissButton: Boolean = false
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Log.d(TAG, "onCreateView called")
        val context = requireContext()
        
        // Create the paywall view
        paywallView = WrappedPaywallComposeView(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            
            // Apply any previously set properties
            paywallListener?.let { setPaywallListener(it) }
            dismissHandler?.let { setDismissHandler(it) }
            offeringId?.let { setOfferingId(it) }
            fontProvider?.let { setFontProvider(it) }
            setDisplayDismissButton(displayDismissButton)
        }
        
        Log.d(TAG, "onCreateView returning paywallView")
        return paywallView
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        paywallView = null
    }
    
    fun setPaywallListener(listener: PaywallListener?) {
        paywallListener = listener
        paywallView?.setPaywallListener(listener)
    }
    
    fun setDismissHandler(handler: (() -> Unit)?) {
        dismissHandler = handler
        paywallView?.setDismissHandler(handler)
    }
    
    fun setOfferingId(id: String?) {
        offeringId = id
        paywallView?.setOfferingId(id)
    }
    
    fun setFontProvider(provider: CustomFontProvider?) {
        fontProvider = provider
        paywallView?.setFontProvider(provider)
    }
    
    fun setDisplayDismissButton(display: Boolean) {
        displayDismissButton = display
        paywallView?.setDisplayDismissButton(display)
    }
}