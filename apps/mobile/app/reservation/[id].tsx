import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { formatEventDateTime, formatMoney } from "@heaven-pass/utils";
import { EXTRA_DEFINITIONS, ExtraType, ReservationStatus } from "@heaven-pass/types";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { StatusBadge } from "../../src/components/StatusBadge";
import {
  addReservationExtra,
  cancelReservation,
  confirmReservation,
  useReservation,
} from "../../src/hooks/useReservations";
import { colors } from "../../src/theme/colors";

const EXTRA_ACTIONS = [ExtraType.LATE_ENTRY, ExtraType.WEATHER_INSURANCE, ExtraType.UPGRADE];

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: reservation, isLoading, refetch } = useReservation(id);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function handleConfirm() {
    if (!reservation) return;
    setPendingAction("confirm");
    try {
      await confirmReservation(reservation.id);
      refetch();
    } catch (err) {
      Alert.alert("No se pudo confirmar", err instanceof Error ? err.message : "Intentá de nuevo.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCancel() {
    if (!reservation) return;
    setPendingAction("cancel");
    try {
      await cancelReservation(reservation.id);
      refetch();
    } catch (err) {
      Alert.alert("No se pudo cancelar", err instanceof Error ? err.message : "Intentá de nuevo.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleAddExtra(type: ExtraType) {
    if (!reservation) return;
    setPendingAction(type);
    try {
      await addReservationExtra(reservation.id, { type });
      refetch();
    } catch (err) {
      Alert.alert("No se pudo agregar", err instanceof Error ? err.message : "Intentá de nuevo.");
    } finally {
      setPendingAction(null);
    }
  }

  if (isLoading || !reservation) {
    return (
      <Screen>
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      </Screen>
    );
  }

  const canConfirm = reservation.status === ReservationStatus.PENDING;
  const canCancel = reservation.status === ReservationStatus.PENDING || reservation.status === ReservationStatus.CONFIRMED;
  const canAddExtras = canCancel;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.eventName}>{reservation.event.name}</Text>
          <StatusBadge status={reservation.status} />
        </View>
        <Text style={styles.meta}>{reservation.event.venue}</Text>
        <Text style={styles.date}>{formatEventDateTime(new Date(reservation.event.startsAt))}</Text>
        <Text style={styles.tier}>Acceso {reservation.accessTier}</Text>

        {reservation.status === ReservationStatus.CONFIRMED && (
          <View style={styles.qrWrapper}>
            <QRCode value={reservation.qrCode} size={200} backgroundColor={colors.textPrimary} color={colors.background} />
          </View>
        )}

        {reservation.status === ReservationStatus.PENDING && reservation.expiresAt && (
          <Text style={styles.hint}>
            Confirmá antes de {new Date(reservation.expiresAt).toLocaleTimeString()} o el cupo se libera.
          </Text>
        )}

        <View style={styles.actions}>
          {canConfirm && (
            <PrimaryButton label="Confirmar reserva" onPress={handleConfirm} loading={pendingAction === "confirm"} />
          )}
          {canCancel && (
            <PrimaryButton
              label="Cancelar reserva"
              variant="danger"
              onPress={() =>
                Alert.alert("Cancelar reserva", "¿Estás seguro?", [
                  { text: "No" },
                  { text: "Sí, cancelar", style: "destructive", onPress: handleCancel },
                ])
              }
              loading={pendingAction === "cancel"}
            />
          )}
        </View>

        {canAddExtras && reservation.accessTier === "GENERAL" && (
          <View style={styles.extrasSection}>
            <Text style={styles.sectionTitle}>Extras</Text>
            {EXTRA_ACTIONS.map((type) => (
              <View key={type} style={styles.extraRow}>
                <View style={styles.extraInfo}>
                  <Text style={styles.extraLabel}>{EXTRA_DEFINITIONS[type].label}</Text>
                  {EXTRA_DEFINITIONS[type].defaultPriceCents != null && (
                    <Text style={styles.extraPrice}>{formatMoney(EXTRA_DEFINITIONS[type].defaultPriceCents!)}</Text>
                  )}
                </View>
                <PrimaryButton
                  label="Agregar"
                  variant="outline"
                  onPress={() => handleAddExtra(type)}
                  loading={pendingAction === type}
                />
              </View>
            ))}
          </View>
        )}

        {reservation.extras.length > 0 && (
          <View style={styles.extrasSection}>
            <Text style={styles.sectionTitle}>Cargos</Text>
            {reservation.extras.map((extra) => (
              <View key={extra.id} style={styles.chargeRow}>
                <Text style={styles.extraLabel}>{EXTRA_DEFINITIONS[extra.type].label}</Text>
                <Text style={styles.extraPrice}>
                  {formatMoney(extra.amountCents, extra.currency)} · {extra.status}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 8, paddingBottom: 48 },
  loader: { marginTop: 60 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  eventName: { color: colors.textPrimary, fontSize: 22, fontWeight: "700", flexShrink: 1 },
  meta: { color: colors.textSecondary, fontSize: 14 },
  date: { color: colors.accent, fontSize: 14, fontWeight: "600" },
  tier: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  qrWrapper: {
    alignSelf: "center",
    backgroundColor: colors.textPrimary,
    padding: 16,
    borderRadius: 20,
    marginVertical: 20,
  },
  hint: { color: colors.warning, fontSize: 13, textAlign: "center", marginVertical: 16 },
  actions: { gap: 12, marginTop: 16 },
  extrasSection: { marginTop: 24, gap: 10 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  extraRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  extraInfo: { flex: 1, gap: 2 },
  extraLabel: { color: colors.textPrimary, fontSize: 13, fontWeight: "600" },
  extraPrice: { color: colors.textSecondary, fontSize: 12 },
  chargeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 10,
  },
});
