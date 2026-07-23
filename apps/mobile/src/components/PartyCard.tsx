import { Pressable, StyleSheet, Text, View } from "react-native";
import type { EventDto } from "@heaven-pass/types";
import { formatEventDateTime } from "@heaven-pass/utils";
import { colors } from "../theme/colors";

export function PartyCard({ event, onPress }: { event: EventDto; onPress: () => void }) {
  const totalAvailable = event.slots.reduce((sum, slot) => sum + slot.available, 0);
  const isSoldOut = totalAvailable === 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.headerRow}>
        <Text style={styles.name} numberOfLines={1}>
          {event.name}
        </Text>
        {isSoldOut && (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>AGOTADO</Text>
          </View>
        )}
      </View>
      <Text style={styles.venue}>
        {event.venue} · {event.city}
      </Text>
      <Text style={styles.date}>{formatEventDateTime(new Date(event.startsAt))}</Text>
      <View style={styles.slotsRow}>
        {event.slots.map((slot) => (
          <View key={slot.id} style={styles.slotPill}>
            <Text style={styles.slotText}>
              {slot.tier} · {slot.available} lugares
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  pressed: { opacity: 0.85 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { color: colors.textPrimary, fontSize: 18, fontWeight: "700", flexShrink: 1 },
  venue: { color: colors.textSecondary, fontSize: 14 },
  date: { color: colors.accent, fontSize: 13, fontWeight: "600" },
  slotsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  slotPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  slotText: { color: colors.textSecondary, fontSize: 11, fontWeight: "600" },
  soldOutBadge: { backgroundColor: colors.danger, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8 },
  soldOutText: { color: colors.textPrimary, fontSize: 10, fontWeight: "700" },
});
