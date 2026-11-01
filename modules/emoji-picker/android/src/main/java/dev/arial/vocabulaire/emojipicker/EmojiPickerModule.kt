package dev.arial.vocabulaire.emojipicker

import android.content.Context
import android.content.res.Configuration
import android.view.ContextThemeWrapper
import android.view.ViewGroup
import androidx.emoji2.emojipicker.EmojiPickerView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.util.Locale

class EmojiPickerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VocabulaireEmojiPicker")
    View(EmojiPickerNativeView::class) {
      Events("onEmojiPicked")
      Prop("language") { view: EmojiPickerNativeView, language: String ->
        view.setLanguage(language)
      }
    }
  }
}

class EmojiPickerNativeView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  override val shouldUseAndroidLayout = true
  private val onEmojiPicked by EventDispatcher()
  private var language = ""

  fun setLanguage(value: String) {
    if (language == value) return
    language = value
    val configuration = Configuration(context.resources.configuration).apply {
      setLocale(Locale.forLanguageTag(value))
    }
    val localizedContext = ContextThemeWrapper(context.createConfigurationContext(configuration), 0)
    localizedContext.theme.setTo(context.theme)
    removeAllViews()
    addView(EmojiPickerView(localizedContext).apply {
      layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
      setOnEmojiPickedListener { onEmojiPicked(mapOf("emoji" to it.emoji)) }
    })
  }

}
