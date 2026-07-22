import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import { stats } from '../content';

export default function StatsBand() {
  return (
    <View style={styles.band}>
      <View style={styles.grid}>
        {stats.map((stat, i) => (
          <View key={i} style={styles.cell}>
            <Text style={styles.number}>{stat.number}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: colors.panel,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lineSoft,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '50%',
    paddingVertical: 24,
    paddingRight: 12,
  },
  number: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 26,
    color: colors.goldLight,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 16,
    color: colors.sandDim,
    marginTop: 8,
  },
});
