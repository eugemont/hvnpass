import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, AccessibilityInfo, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../theme';

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(screenWidth - 64, 340);
const CARD_HEIGHT = CARD_WIDTH / 1.55;
const STUB_WIDTH = 74;

export default function PassCard() {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const startFloating = () => {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 2600,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2600,
            useNativeDriver: true,
          }),
        ])
      );
      loopRef.current.start();
    };

    const stopFloating = () => {
      loopRef.current?.stop();
      floatAnim.setValue(0);
    };

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted && !enabled) startFloating();
    });

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (enabled) stopFloating();
      else startFloating();
    });

    return () => {
      isMounted = false;
      stopFloating();
      sub?.remove?.();
    };
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '2deg'],
  });

  return (
    <View style={styles.stage}>
      <Animated.View style={{ transform: [{ translateY }, { rotate }] }}>
        <LinearGradient
          colors={[colors.dusk, colors.dusk2, '#171226']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
        >
          <View style={styles.topRow}>
            <View>
              <Text style={styles.eyebrow}>MEMBER ACCESS</Text>
              <Text style={styles.brand}>Heaven Pass</Text>
            </View>
          </View>

          <View style={styles.midBlock}>
            <Text style={styles.midLabel}>Temporada</Text>
            <Text style={styles.midValue}>26 / 27 — Punta del Este</Text>
          </View>

          <View style={styles.bottomBlock}>
            <Text style={styles.midLabel}>N.º MIEMBRO</Text>
            <Text style={styles.memberNumber}>HP–0000</Text>
          </View>

          {/* perforated stub divider */}
          <View style={styles.dashedDivider} pointerEvents="none" />
          <View style={[styles.notch, { top: -10 }]} pointerEvents="none" />
          <View style={[styles.notch, { bottom: -10 }]} pointerEvents="none" />

          <View style={styles.stub} pointerEvents="none">
            <Text style={styles.stubText}>ACCESO GARANTIZADO</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(201,167,104,0.4)',
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.goldLight,
    opacity: 0.85,
    marginBottom: 4,
  },
  brand: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    color: colors.sand,
  },
  midBlock: {
    marginTop: 4,
  },
  midLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.sandDim,
    letterSpacing: 0.5,
  },
  midValue: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.sand,
    marginTop: 3,
  },
  bottomBlock: {
    marginTop: 4,
  },
  memberNumber: {
    fontFamily: fonts.monoMedium,
    fontSize: 13,
    color: colors.sand,
    marginTop: 3,
  },
  dashedDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: STUB_WIDTH,
    borderLeftWidth: 1.5,
    borderColor: 'rgba(237,232,218,0.35)',
    borderStyle: 'dashed',
  },
  notch: {
    position: 'absolute',
    right: STUB_WIDTH - 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.void,
  },
  stub: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: STUB_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stubText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 3,
    color: colors.goldLight,
    opacity: 0.85,
    width: 150,
    textAlign: 'center',
    transform: [{ rotate: '90deg' }],
  },
});
