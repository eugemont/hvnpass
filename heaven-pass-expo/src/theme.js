// Design tokens shared by every screen and component.
// Mirrors the palette/type system from the Heaven Pass web landing page.

export const colors = {
  void: '#0A0D16', // base app background — night sky over Punta del Este
  panel: '#12172A', // card / section background
  panel2: '#1A2038', // secondary panel (Black plan, stat cards)
  dusk: '#4A3B78', // dusk purple, used in the pass card gradient
  dusk2: '#2A2145',
  ember: '#D9773F', // warm accent, used sparingly
  ember2: '#C95F2B',
  gold: '#C9A768', // "membership" gold — CTAs, borders, prices
  goldLight: '#E8D9B0',
  sand: '#EDE8DA', // primary text on dark backgrounds
  sandDim: '#A49D8F', // secondary / muted text
  line: 'rgba(201,167,104,0.28)',
  lineSoft: 'rgba(237,232,218,0.12)',
  error: '#E8836B',
};

export const fonts = {
  displayRegular: 'Fraunces_400Regular',
  displaySemiBold: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  displayItalic: 'Fraunces_500Medium_Italic',
  body: 'PublicSans_400Regular',
  bodyMedium: 'PublicSans_500Medium',
  bodySemiBold: 'PublicSans_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemiBold: 'IBMPlexMono_600SemiBold',
};

// Note: the actual font *loading* (useFonts + the require of each .ttf)
// happens in App.js, importing the named weight constants straight from
// each @expo-google-fonts package, per that library's documented usage.
// This file only defines the string names used in fontFamily styles.

export const spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
  xxl: 64,
};

export const radius = 4;
