import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import SectionHeader from './SectionHeader';
import { steps } from '../content';

export default function StepsSection() {
  return (
    <View>
      <SectionHeader eyebrow={steps.eyebrow} title={steps.title} />
      {steps.items.map((step, i) => (
        <View key={step.number} style={[styles.step, i === 0 && styles.stepFirst]}>
          <Text style={styles.number}>{step.number}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepBody}>{step.body}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  step: {
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  stepFirst: {
    marginTop: 0,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  number: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.gold,
    marginBottom: 8,
  },
  stepTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    color: colors.sand,
    marginBottom: 6,
  },
  stepBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.sandDim,
    maxWidth: '90%',
  },
});
