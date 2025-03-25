import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.ComposeView

internal class ViewWrapperFrameLayout<T : View> @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0,
    private val viewFactory: ((Context) -> T)? = null
) : FrameLayout(context, attrs, defStyleAttr) {

    private var initialized = false

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()

        if (!initialized) {
            viewFactory?.invoke(context)?.let { customView ->
                addView(
                    customView, LayoutParams(
                        LayoutParams.MATCH_PARENT,
                        LayoutParams.MATCH_PARENT
                    )
                )
                initialized = true
            }
        }
    }
}

internal class CustomerCenterWrapperView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0,
) : LinearLayout(context, attrs, defStyleAttr) {

    private val composeView = ComposeView(context)

    private var composableContent: (@Composable () -> Unit)? = null
    private var didSetContent = false

    init {
        orientation = VERTICAL
        layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.WRAP_CONTENT
        )

        composeView.layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.WRAP_CONTENT
        )

        addView(composeView)
    }

    fun setComposableContent(content: @Composable () -> Unit) {
        composableContent = content
        maybeSetContent()
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        maybeSetContent()
    }

    private fun maybeSetContent() {
        if (!isAttachedToWindow) {
            Log.d("CustomerCenterWrapperView", "View is not attached yet. Delaying setContent.")
            return
        }

        if (didSetContent) return
//        val lifecycleOwner = ViewTreeLifecycleOwner.get(this)
//        if (lifecycleOwner == null) {
//            Log.w("CustomerCenterWrapperView", "Missing ViewTreeLifecycleOwner. Cannot setContent.")
//            return
//        }

        val content = composableContent
        if (content != null) {
            Log.d("CustomerCenterWrapperView", "Setting Compose content.")
            composeView.setContent(content)
            didSetContent = true
        } else {
            Log.d("CustomerCenterWrapperView", "Content not yet provided.")
        }
    }
}
