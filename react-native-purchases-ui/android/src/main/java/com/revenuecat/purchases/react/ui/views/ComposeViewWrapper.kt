package com.revenuecat.purchases.react.ui.views

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.lifecycle.ProcessLifecycleOwner
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

    private val savedStateRegistryOwner: SavedStateRegistryOwner? by lazy { findSavedStateRegistryOwner() }
    private val viewModelStoreOwner: ViewModelStoreOwner? by lazy { findViewModelStoreOwner() }

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
        // See: https://github.com/RevenueCat/react-native-purchases/issues/1315
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
        var level = 0

        while (parent != null && level < 10) { // Limit search depth
            if (parent is FrameLayout) {
                setComposeOwnersOnView(parent)
            }
            parent = parent.parent
            level++
        }
    }

    private fun setComposeOwnersOnView(view: View) {
        try {
            if (view.findViewTreeLifecycleOwner() == null) {
                view.setViewTreeLifecycleOwner(ProcessLifecycleOwner.get())
            }

            if (view.findViewTreeSavedStateRegistryOwner() == null) {
                savedStateRegistryOwner?.let { owner ->
                    view.setViewTreeSavedStateRegistryOwner(owner)
                }
            }

            if (view.findViewTreeViewModelStoreOwner() == null) {
                viewModelStoreOwner?.let { owner ->
                    view.setViewTreeViewModelStoreOwner(owner)
                }
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
}
