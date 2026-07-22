import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import SectionHeader from './SectionHeader';
import { compare } from '../content';

function CompareList({ label, items, isAfter }) {
  return (
    <View style={[styles.col, isAfter && styles.colAfter]}>
      <Text style={[styles.colLabel, isAfter && styles.colLabelAfter]}>{label}</Text>
      {items.map((item, i) => (
        <View key={i} style={[styles.row, i === 0 && styles.rowFirst]}>
          <Text style={[styles.marker, isAfter && styles.markerAfter]}>{isAfter ? '✓' : '×'}</Text>
          <Text style={[styles.itemText, isAfter && styles.itemTextAfter]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function CompareSection() {
  return (
    <View style={styles.section}>
      <SectionHeader eyebrow={compare.eyebrow} title={compare.title} />
      <CompareList label={compare.before.label} items={compare.before.items} isAfter={false} />
      <View style={{ height: 14 }} />
      <CompareList label={compare.after.label} items={compare.after.items} isAfter />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  col: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: 4,
    padding: 20,
  },
  colAfter: {
    borderColor: colors.line,
  },
  colLabel: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.sandDim,
    marginBottom: 14,
  },
  colLabelAfter: {
    color: colors.gold,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  marker: {
    fontFamily: fonts.mono,
    color: colors.sandDim,
    marginRight: 10,
    width: 14,
  },
  markerAfter: {
    color: colors.gold,
  },
  itemText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.sandDim,
  },
  itemTextAfter: {
    color: colors.sand,
  },
});
