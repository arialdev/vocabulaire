import * as Font from 'expo-font';

/** Statically bundled resources; no network is involved at runtime. */
export function loadNotebookFonts() {
  return Font.loadAsync({
    EBGaramondRegular: require('../../assets/fonts/EBGaramond_400Regular.ttf'),
    EBGaramondSemiBold: require('../../assets/fonts/EBGaramond_600SemiBold.ttf'),
    DMSansRegular: require('../../assets/fonts/DMSans_400Regular.ttf'),
    DMSansMedium: require('../../assets/fonts/DMSans_500Medium.ttf'),
    DMSansSemiBold: require('../../assets/fonts/DMSans_600SemiBold.ttf'),
    MaterialSymbols: require('../../assets/fonts/MaterialSymbols_400Regular.ttf'),
  });
}
