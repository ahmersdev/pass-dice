package expo.modules.appprivacy

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.os.PersistableBundle
import android.view.WindowManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Same key as ClipDescription.EXTRA_IS_SENSITIVE (Android 13). Older versions ignore it.
private const val EXTRA_IS_SENSITIVE = "android.content.extra.IS_SENSITIVE"

// Marks clips written by this app, so they can be recognised from the clip
// description alone without reading what another app copied (which would show
// the system's "pasted from your clipboard" notice).
private const val CLIP_LABEL = "pass-dice-password"

class AppPrivacyModule : Module() {
  private val clipboardManager: ClipboardManager
    get() {
      val context = requireNotNull(appContext.reactContext) { "React context is not available" }
      return context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    }

  override fun definition() = ModuleDefinition {
    Name("AppPrivacy")

    // Copies plain text and marks the clip as sensitive, so Android 13+ hides
    // it from the clipboard preview and keyboards can skip their history.
    AsyncFunction("copySensitive") { text: String ->
      val clip = ClipData.newPlainText(CLIP_LABEL, text)
      clip.description.extras = PersistableBundle().apply {
        putBoolean(EXTRA_IS_SENSITIVE, true)
      }
      clipboardManager.setPrimaryClip(clip)
    }

    // Reports what is on the clipboard without touching other apps' content:
    //   status "own"         the clip was written by this app; `text` is its text
    //   status "other"       the clip belongs to something else
    //   status "unavailable" nothing readable (empty, or Android 10+ is not
    //                        letting a background app read it)
    AsyncFunction("readOwnClip") {
      val manager = clipboardManager
      val description = manager.primaryClipDescription
        ?: return@AsyncFunction mapOf("status" to "unavailable")

      if (description.label?.toString() != CLIP_LABEL) {
        return@AsyncFunction mapOf("status" to "other")
      }

      val text = manager.primaryClip
        ?.takeIf { it.itemCount > 0 }
        ?.getItemAt(0)
        ?.text
        ?.toString()
        ?: return@AsyncFunction mapOf("status" to "unavailable")

      mapOf("status" to "own", "text" to text)
    }

    AsyncFunction("clearClipboard") {
      val manager = clipboardManager
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        manager.clearPrimaryClip()
      } else {
        manager.setPrimaryClip(ClipData.newPlainText("", ""))
      }
    }

    // Blanks the recent-apps preview while the app is in the background.
    // Screenshots and recordings still work while the app is on screen.
    OnActivityEntersBackground { setWindowSecure(true) }
    OnActivityEntersForeground { setWindowSecure(false) }
  }

  private fun setWindowSecure(secure: Boolean) {
    val activity = appContext.currentActivity ?: return
    activity.runOnUiThread {
      if (secure) {
        activity.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
      } else {
        activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
      }
    }
  }
}
