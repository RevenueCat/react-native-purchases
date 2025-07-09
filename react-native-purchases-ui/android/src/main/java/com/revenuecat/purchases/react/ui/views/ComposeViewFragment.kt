package com.revenuecat.purchases.react.ui.views

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment

/**
 * Base Fragment for wrapping Compose views in React Native.
 *
 * This Fragment-based approach fixes lifecycle owner issues by leveraging
 * Fragment's built-in lifecycle management. Fragments automatically provide:
 * - ViewTreeLifecycleOwner through the Fragment's lifecycle
 * - SavedStateRegistryOwner through the Fragment
 * - ViewModelStoreOwner through the Fragment
 *
 * This eliminates the need for manual owner setup that was required in
 * ComposeViewWrapper, especially in React Native modal scenarios.
 */
abstract class ComposeViewFragment : Fragment() {
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return createComposeView()
    }

    /**
     * Creates the Compose view (PaywallView, etc.) that leverages Fragment's lifecycle.
     * Fragment automatically provides all required lifecycle owners.
     */
    protected abstract fun createComposeView(): View
}