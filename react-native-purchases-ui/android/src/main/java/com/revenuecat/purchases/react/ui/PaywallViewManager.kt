package com.revenuecat.purchases.react.ui

import android.util.Log
import android.view.Choreographer
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.revenuecat.purchases.ui.revenuecatui.fonts.CustomFontProvider
import javax.annotation.Nullable

internal class PaywallViewManager : BasePaywallViewManager<FrameLayout>() {

    companion object {
        const val REACT_CLASS = "Paywall"
        const val COMMAND_CREATE = 1
        const val TAG = "PaywallViewManager"
    }

    private var fragmentsMap = mutableMapOf<Int, PaywallFragment>()

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): FrameLayout {
        return FrameLayout(themedReactContext).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
    }

    override fun createShadowNodeInstance(): PaywallViewShadowNode {
        return PaywallViewShadowNode()
    }

    override fun getCommandsMap(): Map<String, Int> {
        return mapOf("create" to COMMAND_CREATE)
    }

    override fun receiveCommand(
        root: FrameLayout,
        commandId: String,
        @Nullable args: ReadableArray?
    ) {
        super.receiveCommand(root, commandId, args)

        val reactNativeViewId = args?.getInt(0) ?: return
        Log.d(TAG, "receiveCommand: commandId=$commandId, reactNativeViewId=$reactNativeViewId")

        when (commandId) {
            "create" -> {
                createFragment(root, reactNativeViewId)
            }
        }
    }

    private fun createFragment(root: FrameLayout, reactNativeViewId: Int) {
        Log.d(TAG, "createFragment: reactNativeViewId=$reactNativeViewId")
        Log.d(TAG, "createFragment: root.id=${root.id}")
        
        setupLayout(root)

        val fragment = PaywallFragment().apply {
            // Set up the fragment with the listener and handlers
            setPaywallListener(createPaywallListenerWrapper(root.context as ThemedReactContext, root))
            setDismissHandler(getDismissHandler(root.context as ThemedReactContext, root))
        }

        fragmentsMap[reactNativeViewId] = fragment

        val activity = (root.context as? ReactContext)?.currentActivity
        Log.d(TAG, "createFragment: activity=$activity")
        
        if (activity is FragmentActivity) {
            // Ensure root has an ID
            if (root.id == View.NO_ID) {
                root.id = reactNativeViewId
                Log.d(TAG, "createFragment: set root.id to $reactNativeViewId")
            }
            
            Log.d(TAG, "createFragment: root.isAttachedToWindow = ${root.isAttachedToWindow}")
            Log.d(TAG, "createFragment: root.parent = ${root.parent}")
            
            // Wait for the view to be attached to the window before committing the fragment
            if (root.isAttachedToWindow) {
                commitFragmentTransaction(activity, root, fragment, reactNativeViewId)
            } else {
                Log.d(TAG, "createFragment: view not attached, waiting for attachment")
                root.addOnAttachStateChangeListener(object : View.OnAttachStateChangeListener {
                    override fun onViewAttachedToWindow(v: View) {
                        Log.d(TAG, "createFragment: view attached, committing fragment")
                        v.removeOnAttachStateChangeListener(this)
                        commitFragmentTransaction(activity, root, fragment, reactNativeViewId)
                    }
                    
                    override fun onViewDetachedFromWindow(v: View) {
                        Log.d(TAG, "createFragment: view detached")
                        v.removeOnAttachStateChangeListener(this)
                    }
                })
            }
        } else {
            Log.e(TAG, "createFragment: activity is not FragmentActivity or is null")
        }
    }

    private fun commitFragmentTransaction(
        activity: FragmentActivity,
        root: FrameLayout,
        fragment: PaywallFragment,
        reactNativeViewId: Int
    ) {
        Log.d(TAG, "commitFragmentTransaction: about to add fragment with containerId=${root.id}")
        Log.d(TAG, "commitFragmentTransaction: fragment tag=${reactNativeViewId}")
        
        try {
            // Let's try to verify the view can be found by the activity
            val foundView = activity.findViewById<View>(root.id)
            Log.d(TAG, "commitFragmentTransaction: activity.findViewById(${root.id}) = $foundView")
            Log.d(TAG, "commitFragmentTransaction: root view = $root")
            
            if (foundView == null) {
                Log.w(TAG, "commitFragmentTransaction: View not found in activity hierarchy, using fallback approach")
                // If the view is not in the activity's hierarchy (e.g., in a Modal),
                // we need to use a different approach - create a temporary container
                // that the FragmentManager can manage
                
                // Create a temporary container in the activity's content view
                val activityContentView = activity.findViewById<ViewGroup>(android.R.id.content)
                val tempContainer = FrameLayout(activity).apply {
                    id = View.generateViewId()
                    layoutParams = ViewGroup.LayoutParams(0, 0) // Hidden temporary container
                }
                
                // Add the temporary container to the activity
                activityContentView.addView(tempContainer)
                
                // Use the temporary container for the fragment transaction
                activity.supportFragmentManager
                    .beginTransaction()
                    .add(tempContainer.id, fragment, reactNativeViewId.toString())
                    .commitAllowingStateLoss()
                
                // Wait for the fragment to be created, then move its view to our root
                root.post {
                    val fragmentView = fragment.view
                    if (fragmentView != null) {
                        // Remove the fragment's view from the temporary container
                        tempContainer.removeView(fragmentView)
                        
                        // Add it to our actual root container
                        root.addView(fragmentView)
                        
                        // Clean up the temporary container
                        activityContentView.removeView(tempContainer)
                        
                        Log.d(TAG, "commitFragmentTransaction: Moved fragment view to actual container")
                    }
                }
            } else {
                activity.supportFragmentManager
                    .beginTransaction()
                    .add(root.id, fragment, reactNativeViewId.toString())
                    .commitAllowingStateLoss()
                Log.d(TAG, "commitFragmentTransaction: fragment transaction committed successfully")
            }
        } catch (e: Exception) {
            Log.e(TAG, "commitFragmentTransaction: error committing fragment transaction", e)
        }
    }

    private fun setupLayout(view: View) {
        Choreographer.getInstance().postFrameCallback(object : Choreographer.FrameCallback {
            override fun doFrame(frameTimeNanos: Long) {
                manuallyLayoutChildren(view)
                view.viewTreeObserver.dispatchOnGlobalLayout()
                Choreographer.getInstance().postFrameCallback(this)
            }
        })
    }

    private fun manuallyLayoutChildren(view: View) {
        view.measure(
            View.MeasureSpec.makeMeasureSpec(view.measuredWidth, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(view.measuredHeight, View.MeasureSpec.EXACTLY)
        )
        view.layout(view.left, view.top, view.right, view.bottom)
    }

    override fun setOfferingId(view: FrameLayout, identifier: String) {
        val fragment = findFragmentForView(view)
        fragment?.setOfferingId(identifier)
    }

    override fun setFontFamily(view: FrameLayout, customFontProvider: CustomFontProvider) {
        val fragment = findFragmentForView(view)
        fragment?.setFontProvider(customFontProvider)
    }

    override fun setDisplayDismissButton(view: FrameLayout, display: Boolean) {
        val fragment = findFragmentForView(view)
        fragment?.setDisplayDismissButton(display)
    }

    private fun findFragmentForView(view: FrameLayout): PaywallFragment? {
        // Find the fragment associated with this view by checking for a fragment with the view's ID
        val activity = (view.context as? ReactContext)?.currentActivity
        if (activity is FragmentActivity && view.id != View.NO_ID) {
            return activity.supportFragmentManager.findFragmentById(view.id) as? PaywallFragment
        }
        return fragmentsMap.values.firstOrNull()
    }

    override fun onDropViewInstance(view: FrameLayout) {
        super.onDropViewInstance(view)

        // Clean up the fragment when the view is dropped
        val activity = (view.context as? ReactContext)?.currentActivity
        if (activity is FragmentActivity && view.id != View.NO_ID) {
            val fragment = activity.supportFragmentManager.findFragmentById(view.id)
            if (fragment != null) {
                activity.supportFragmentManager
                    .beginTransaction()
                    .remove(fragment)
                    .commit()
            }
        }

        // Clean up fragment references
        fragmentsMap.clear()
    }
}
