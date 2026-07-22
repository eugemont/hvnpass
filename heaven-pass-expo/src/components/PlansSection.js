import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import SectionHeader from './SectionHeader';
import { plans } from '../content';

function PlanCard({ plan }) {
  return (
    <View style={[styles.card, plan.isFeatured && styles.cardFeatured]}>
      <Text style={styles.name}>{plan.name}</Text>
      <Text style={styles.price}>{plan.price}</Text>
      <Text style={styles.tag}>{plan.tag}</Text>
      {plan.features.map((feature, i) => (
        <View key={i} style={[styles.featureRow, i === 0 && styles.featureRowFirst]}>
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
      {plan.footnote ? <Text style={styles.footnote}>{plan.footnote}</Text> : null}
    </View>
  );
}

export default function PlansSection() {
  return (
    <View>
      <SectionHeader eyebrow={plans.eyebrow} title={plans.title} />
      {plans.items.map((plan, i) => (
        <View key={plan.id} style={i > 0 ? { marginTop: 16 } : null}>
          <PlanCard plan={plan} />
        </View>
      ))}
      <Text style={styles.note}>{plans.note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: 4,
    padding: 22,
  },
  cardFeatured: {
    backgroundColor: colors.panel2,
    borderColor: colors.line,
  },
  name: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.gold,
    marginBottom: 10,
  },
  price: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 32,
    color: colors.sand,
  },
  tag: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.sandDim,
    marginTop: 4,
    marginBottom: 16,
  },
  featureRow: {
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
    borderStyle: 'dashed',
    paddingVertical: 9,
  },
  featureRowFirst: {
    borderTopWidth: 0,
  },
  featureText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.sandDim,
  },
  footnote: {
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 17,
    color: colors.sandDim,
    opacity: 0.8,
    marginTop: 14,
  },
  note: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.sandDim,
    opacity: 0.8,
    marginTop: 18,
  },
});
