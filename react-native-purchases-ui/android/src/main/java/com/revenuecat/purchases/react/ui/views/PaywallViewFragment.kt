package com.revenuecat.purchases.react.ui.views

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.revenuecat.purchases.ui.revenuecatui.views.PaywallView

/**
 * Fragment that wraps PaywallView with proper lifecycle management.
 *
 * The Fragment automatically provides all required lifecycle owners,
 * eliminating ViewTreeLifecycleOwner crashes in React Native modals.
 */
class PaywallViewFragment : Fragment() {

    private var paywallView: PaywallView? = null

    override fun onCreateView(inflater: LayoutInflater,
                              container: ViewGroup?,
                              savedInstanceState: Bundle?): View {
        super.onCreateView(inflater, container, savedInstanceState)
        return PaywallView(requireNotNull(context)).also {
            paywallView = it
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        // do any logic that should happen in an `onCreate` method, e.g:
        // customView.onCreate(savedInstanceState);
    }

    override fun onPause() {
        super.onPause()
        // do any logic that should happen in an `onPause` method
        // e.g.: customView.onPause();
    }

    override fun onResume() {
        super.onResume()
        // do any logic that should happen in an `onResume` method
        // e.g.: customView.onResume();
    }

    override fun onDestroy() {
        super.onDestroy()
        // do any logic that should happen in an `onDestroy` method
        // e.g.: customView.onDestroy();
    }
}
