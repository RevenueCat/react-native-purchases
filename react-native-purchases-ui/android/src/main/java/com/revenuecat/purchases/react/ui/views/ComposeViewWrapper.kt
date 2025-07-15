package com.revenuecat.purchases.react.ui.views

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.util.AttributeSet
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.findViewTreeLifecycleOwner
import androidx.lifecycle.findViewTreeViewModelStoreOwner
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeViewModelStoreOwner
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.findViewTreeSavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner

/**
 * Base wrapper for Compose views in React Native.
 *
 * Fixes the issue where Compose views crash in React Native modals with:
 * - "ViewTreeLifecycleOwner not found"
 * - "ViewTreeSavedStateRegistryOwner not found"
 * - "No ViewModelStoreOwner was provided"
 *
 * React Native modals create isolated view hierarchies without the owners
 * that Compose requires. This wrapper automatically sets all required owners
 * on the modal containers.
 *
 * This wrapper also fixes a Cannot locate windowRecomposer error
 * See: https://github.com/RevenueCat/react-native-purchases/issues/1162
 */
abstract class ComposeViewWrapper<T : View> : FrameLayout {
    protected var wrappedView: T? = null
    protected var isAttached = false

    constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
        init(context, attrs)
    }

    constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr) {
        init(context, attrs)
    }

    constructor(context: Context) : super(context) {
        init(context, null)
    }

    protected abstract fun createWrappedView(context: Context, attrs: AttributeSet?): T

    private fun init(context: Context, attrs: AttributeSet?) {
        wrappedView = createWrappedView(context, attrs).apply {
            layoutParams = LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
        addView(wrappedView)
    }

    override fun onAttachedToWindow() {
        // CRITICAL: Set Compose owners on React Native modal container
        // This fixes the issue where Compose views crash in React Native modals
        // because it looks like modals create isolated view hierarchies without
        // the required owners and it will crash with:
        // https://github.com/RevenueCat/react-native-purchases/issues/1315
        setComposeOwnersOnFrameLayoutContainerIfNeeded()

        super.onAttachedToWindow()
        isAttached = true

        post {
            requestLayout()
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        isAttached = false
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        if (isAttached) {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        } else {
            setMeasuredDimension(
                MeasureSpec.getSize(widthMeasureSpec),
                MeasureSpec.getSize(heightMeasureSpec)
            )
        }
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        if (isAttached) {
            wrappedView?.requestLayout()
        }
    }

    private fun setComposeOwnersOnFrameLayoutContainerIfNeeded() {
        var parent = this.parent
        var firstFrameLayoutFound = false

        while (!firstFrameLayoutFound && parent != null) {
            if (parent is FrameLayout) {
                firstFrameLayoutFound = true
                setComposeOwnersOnView(parent)
            }
            parent = parent.parent
        }
    }

    private fun setComposeOwnersOnView(view: View) {
        try {
            val activity = findActivity()

            if (view.findViewTreeLifecycleOwner() == null) {
                val owner = activity ?: ProcessLifecycleOwner.get()
                view.setViewTreeLifecycleOwner(owner as LifecycleOwner)
            }

            if (view.findViewTreeSavedStateRegistryOwner() == null) {
                val owner = findSavedStateRegistryOwner() ?: (activity as? SavedStateRegistryOwner)
                owner?.let { view.setViewTreeSavedStateRegistryOwner(it) }
            }

            if (view.findViewTreeViewModelStoreOwner() == null) {
                val owner = findViewModelStoreOwner() ?: (activity as? ViewModelStoreOwner)
                owner?.let { view.setViewTreeViewModelStoreOwner(it) }
            }
        } catch (e: Exception) {
            Log.w("ComposeViewWrapper",
                "Failed to set Compose owners on ${view.javaClass.simpleName}: ${e.message}"
            )
        }
    }

    private fun findSavedStateRegistryOwner(): SavedStateRegistryOwner? {
        // Check direct context first (most common case)
        if (context is SavedStateRegistryOwner) {
            return context as SavedStateRegistryOwner
        }

        // Then traverse the context wrapper chain
        var currentContext = (context as? android.content.ContextWrapper)?.baseContext
        while (currentContext != null) {
            if (currentContext is SavedStateRegistryOwner) {
                return currentContext
            }
            currentContext = (currentContext as? android.content.ContextWrapper)?.baseContext
        }
        return null
    }

    private fun findViewModelStoreOwner(): ViewModelStoreOwner? {
        // Check direct context first (most common case)
        if (context is ViewModelStoreOwner) {
            return context as ViewModelStoreOwner
        }

        // Then traverse the context wrapper chain
        var currentContext = (context as? android.content.ContextWrapper)?.baseContext
        while (currentContext != null) {
            if (currentContext is ViewModelStoreOwner) {
                return currentContext
            }
            currentContext = (currentContext as? android.content.ContextWrapper)?.baseContext
        }
        return null
    }

    private fun findActivity(): Activity? {
        // Check direct context first (most common case)
        if (context is Activity) {
            return context as Activity
        }

        // Then traverse the context wrapper chain
        var currentContext = context
        while (currentContext is ContextWrapper) {
            if (currentContext is Activity) {
                return currentContext
            }
            currentContext = currentContext.baseContext
        }
        return null
    }
}
