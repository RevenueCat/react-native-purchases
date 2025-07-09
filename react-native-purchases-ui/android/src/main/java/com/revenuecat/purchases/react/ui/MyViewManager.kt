package com.revenuecat.purchases.react.ui

import android.view.Choreographer
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.FragmentActivity
import androidx.fragment.app.FragmentContainerView
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactPropGroup
import com.revenuecat.purchases.react.ui.views.PaywallViewFragment

class MyViewManager(
    private val reactContext: ReactApplicationContext
) : ViewGroupManager<FrameLayout>() {
    private var propWidth: Int? = null
    private var propHeight: Int? = null

    override fun getName() = REACT_CLASS

    /**
     * Return a FrameLayout which will later hold the Fragment
     */
    override fun createViewInstance(reactContext: ThemedReactContext): FrameLayout {
        return FrameLayout(reactContext).apply {
            // Set a unique ID for the container
            id = View.generateViewId()
        }
    }

    /**
     * Map the "create" command to an integer
     */
    override fun getCommandsMap() = mapOf("create" to COMMAND_CREATE)

    /**
     * Handle "create" command (called from JS) and call createFragment method
     */
    override fun receiveCommand(
        root: FrameLayout,
        commandId: String,
        args: ReadableArray?
    ) {
        super.receiveCommand(root, commandId, args)
        val reactNativeViewId = requireNotNull(args).getInt(0)

        when (commandId.toInt()) {
            COMMAND_CREATE -> createFragment(root, reactNativeViewId)
        }
    }

    override fun receiveCommand(root: FrameLayout, commandId: Int, args: ReadableArray?) {
        super.receiveCommand(root, commandId, args)
        val reactNativeViewId = requireNotNull(args).getInt(0)

        when (commandId) {
            COMMAND_CREATE -> createFragment(root, reactNativeViewId)
        }
    }


    @ReactPropGroup(names = ["width", "height"], customType = "Style")
    fun setStyle(view: FrameLayout, index: Int, value: Int) {
        if (index == 0) propWidth = value
        if (index == 1) propHeight = value
    }

    /**
     * Create a FragmentContainerView and add the PaywallViewFragment to it
     */
    fun createFragment(root: FrameLayout, reactNativeViewId: Int) {
        try {
            val activity = reactContext.currentActivity as? FragmentActivity

            if (activity == null) {
                println("Activity is null, cannot create fragment")
                return
            }

            // Create a FragmentContainerView as a child of the FrameLayout
            val fragmentContainer = FragmentContainerView(activity)
            val containerId = View.generateViewId()
            fragmentContainer.id = containerId

            val layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            fragmentContainer.layoutParams = layoutParams

            // Add the fragment container to the root
            root.addView(fragmentContainer)

            // Ensure the view is properly laid out before creating the fragment
            fragmentContainer.post {
                try {
                    // Check if the view is still attached and has a valid ID
                    if (!fragmentContainer.isAttachedToWindow || fragmentContainer.id == View.NO_ID) {
                        println("Fragment container not properly attached or has invalid ID")
                        return@post
                    }

                    val myFragment = PaywallViewFragment()

                    // Use commitAllowingStateLoss to avoid state loss issues
                    activity.supportFragmentManager
                        .beginTransaction()
                        .replace(containerId, myFragment, reactNativeViewId.toString())
                        .commitAllowingStateLoss()

                    println("Fragment created successfully with container ID: $containerId")

                } catch (e: Exception) {
                    println("Error creating fragment in post: ${e.message}")
                    e.printStackTrace()
                }
            }

        } catch (e: Exception) {
            println("Error creating fragment: ${e.message}")
            e.printStackTrace()
        }
    }

    fun setupLayout(view: View) {
        Choreographer.getInstance().postFrameCallback(object: Choreographer.FrameCallback {
            override fun doFrame(frameTimeNanos: Long) {
                manuallyLayoutChildren(view)
                view.viewTreeObserver.dispatchOnGlobalLayout()
                Choreographer.getInstance().postFrameCallback(this)
            }
        })
    }

    /**
     * Layout all children properly
     */
    private fun manuallyLayoutChildren(view: View) {
        // propWidth and propHeight coming from react-native props
        val width = requireNotNull(propWidth)
        val height = requireNotNull(propHeight)

        view.measure(
            View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY))

        view.layout(0, 0, width, height)
    }

    companion object {
        private const val REACT_CLASS = "MyViewManager"
        private const val COMMAND_CREATE = 1
    }
}
