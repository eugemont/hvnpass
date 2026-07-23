import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatEventDateTime } from "@heaven-pass/utils";
import { MembershipStatus } from "@heaven-pass/types";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { useAuth } from "../../src/hooks/useAuth";
import { useEvent } from "../../src/hooks/useEvents";
import { useMemberships } from "../../src/hooks/useMemberships";
import { createReservation } from "../../src/hooks/useReservations";
import { colors, planAccent } from "../../src/theme/colors";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: event, isLoading, error } = useEvent(id);
  const { data: memberships } = useMemberships();
  const [isReserving, setIsReserving] = useState(false);

  const activeMembership = memberships?.find((m) => m.status === MembershipStatus.ACTIVE);

  async function handleReserve() {
    if (!event || !activeMembership) return;
    setIsReserving(true);
    try {
      const reservation = await createReservation({ membershipId: activeMembership.id, eventId: event.id });
      router.replace(`/reservation/${reservation.id}`);
    } catch (err) {
      Alert.alert("No se pudo reservar", err instanceof Error ? err.message : "Intentá de nuevo.");
    } finally {
      setIsReserving(false);
    }
  }

  if (isLoading || !event) {
    return (
      <Screen>
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <Text style={styles.error}>{error}</Text>
      </Screen>
    );
  }

  const mySlot = activeMembership ? event.slots.find((s) => s.tier === activeMembership.accessTier) : undefined;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{event.name}</Text>
        <Text style={styles.meta}>
          {event.venue} · {event.city}
        </Text>
        <Text style={styles.date}>{formatEventDateTime(new Date(event.startsAt))}</Text>
        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.slotsSection}>
          <Text style={styles.sectionTitle}>Cupos por tier</Text>
          {event.slots.map((slot) => (
            <View key={slot.id} style={styles.slotRow}>
              <Text style={styles.slotTier}>{slot.tier}</Text>
              <Text style={styles.slotAvailable}>{slot.available} disponibles</Text>
            </View>
          ))}
        </View>

        {!user ? (
          <Text style={styles.hint}>Iniciá sesión en tu perfil para reservar.</Text>
        ) : !activeMembership ? (
          <Text style={styles.hint}>Necesitás una membresía activa para reservar. Comprá una desde tu perfil.</Text>
        ) : !mySlot || mySlot.available === 0 ? (
          <Text style={styles.hint}>No quedan cupos {activeMembership.accessTier} para esta fiesta.</Text>
        ) : (
          <PrimaryButton
            label={`Reservar (${activeMembership.accessTier})`}
            onPress={handleReserve}
            loading={isReserving}
          />
        )}

        {activeMembership && (
          <Text style={[styles.membershipHint, { color: planAccent[activeMembership.plan] }]}>
            Reservando con tu membresía {activeMembership.plan} · {activeMembership.accessesRemaining} accesos
            restantes
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12, paddingBottom: 48 },
  loader: { marginTop: 60 },
  error: { color: colors.danger, textAlign: "center", marginTop: 40 },
  name: { color: colors.textPrimary, fontSize: 26, fontWeight: "700" },
  meta: { color: colors.textSecondary, fontSize: 14 },
  date: { color: colors.accent, fontSize: 14, fontWeight: "600" },
  description: { color: colors.textSecondary, fontSize: 14, marginTop: 8, lineHeight: 20 },
  slotsSection: { marginTop: 16, gap: 8 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  slotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotTier: { color: colors.textPrimary, fontWeight: "600" },
  slotAvailable: { color: colors.textSecondary },
  hint: { color: colors.textSecondary, fontSize: 13, marginTop: 16, textAlign: "center" },
  membershipHint: { fontSize: 12, fontWeight: "600", textAlign: "center", marginTop: 8 },
});
