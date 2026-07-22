import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { Fraunces_400Regular, Fraunces_600SemiBold, Fraunces_700Bold, Fraunces_500Medium_Italic } from '@expo-google-fonts/fraunces';
import { PublicSans_400Regular, PublicSans_500Medium, PublicSans_600SemiBold } from '@expo-google-fonts/public-sans';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';

import { colors, fonts } from './src/theme';
import { hero, quote, footer } from './src/content';
import useWaitlistCount from './src/useWaitlistCount';

import PassCard from './src/components/PassCard';
import CompareSection from './src/components/CompareSection';
import StepsSection from './src/components/StepsSection';
import PlansSection from './src/components/PlansSection';
import StatsBand from './src/components/StatsBand';
import WaitlistForm from './src/components/WaitlistForm';
import AdminModal from './src/components/AdminModal';

SplashScreen.preventAutoHideAsync().catch(() => {});

function countLabel(count) {
  if (count === null) return 'Cargando lista de espera…';
  if (count === 0) return 'Sé el primero en anotarte.';
  if (count === 1) return '1 persona ya está en la lista.';
  return `${count} personas ya están en la lista.`;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_500Medium_Italic,
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_600SemiBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  const { count, refresh } = useWaitlistCount();
  const [adminVisible, setAdminVisible] = useState(false);

  const scrollRef = useRef(null);
  const waitlistY = useRef(0);

  const handleWaitlistLayout = useCallback((e) => {
    waitlistY.current = e.nativeEvent.layout.y;
  }, []);

  const scrollToWaitlist = useCallback(() => {
    scrollRef.current?.scrollTo({ y: Math.max(waitlistY.current - 24, 0), animated: true });
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />

        <View style={styles.header}>
          <Text style={styles.logo}>
            HEAVEN <Text style={{ color: colors.gold }}>PASS</Text>
          </Text>
          <Pressable style={styles.navCta} onPress={scrollToWaitlist}>
            <Text style={styles.navCtaText}>Sumarme →</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* HERO */}
            <View style={styles.section}>
              <Text style={styles.heroEyebrow}>{hero.eyebrow}</Text>
              <Text style={styles.heroTitle}>
                {hero.titleLines[0]}
                {'\n'}
                {hero.titleLines[1]}
                {'\n'}
                {hero.titleLines[2]}
                <Text style={styles.heroEmphasis}>{hero.titleEmphasis}</Text>.
              </Text>
              <Text style={styles.heroSub}>{hero.subtitle}</Text>

              <Pressable style={styles.heroCta} onPress={scrollToWaitlist}>
                <Text style={styles.heroCtaText}>{hero.ctaLabel}</Text>
              </Pressable>
              <Text style={styles.heroCounter}>{countLabel(count)}</Text>

              <PassCard />
            </View>

            {/* QUOTE */}
            <View style={styles.quoteSection}>
              <Text style={styles.quoteText}>{quote}</Text>
            </View>

            <View style={styles.section}>
              <CompareSection />
            </View>

            <View style={styles.section}>
              <StepsSection />
            </View>

            <View style={styles.section}>
              <PlansSection />
            </View>

            <View style={styles.statsWrap}>
              <StatsBand />
            </View>

            <View style={styles.section} onLayout={handleWaitlistLayout}>
              <WaitlistForm count={count} onSubmitted={refresh} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{footer.text}</Text>
              <Pressable onPress={() => setAdminVisible(true)}>
                <Text style={styles.footerLink}>{footer.adminLabel}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <AdminModal
          visible={adminVisible}
          onClose={() => setAdminVisible(false)}
          onChange={refresh}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.void,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  logo: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 15,
    color: colors.sand,
    letterSpacing: 0.5,
  },
  navCta: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(201,167,104,0.06)',
  },
  navCtaText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.sand,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  heroEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: 14,
  },
  heroTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 34,
    lineHeight: 40,
    color: colors.sand,
  },
  heroEmphasis: {
    fontFamily: fonts.displayItalic,
    color: colors.goldLight,
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.sandDim,
    marginTop: 18,
    marginBottom: 26,
  },
  heroCta: {
    backgroundColor: colors.gold,
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 14,
    color: colors.void,
  },
  heroCounter: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.sandDim,
    marginTop: 14,
    textAlign: 'center',
  },
  quoteSection: {
    marginTop: 44,
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineSoft,
    alignItems: 'center',
  },
  quoteText: {
    fontFamily: fonts.displayItalic,
    fontSize: 20,
    lineHeight: 28,
    color: colors.goldLight,
    textAlign: 'center',
  },
  statsWrap: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 48,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.sandDim,
    marginBottom: 10,
  },
  footerLink: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.sandDim,
    opacity: 0.7,
    textDecorationLine: 'underline',
  },
});
