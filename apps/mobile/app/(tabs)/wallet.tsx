import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { formatEventDateTime } from "@heaven-pass/utils";
import { ReservationStatus } from "@heaven-pass/types";
import { Screen } from "../../src/components/Screen";
import { useAuth } from "../../src/hooks/useAuth";
import { useReservations } from "../../src/hooks/useReservations";
import { colors } from "../../src/theme/colors";

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useReservations();

  const activeAccesses = (data ?? []).filter((r) => r.status === ReservationStatus.CONFIRMED);

  if (!user) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.subtitle}>Iniciá sesión para ver tu wallet de accesos.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
        <Text style={styles.subtitle}>Mostrá el QR en la puerta para ingresar.</Text>
      </View>

      {isLoading && !data ? (
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      ) : (
        <FlatList
          data={activeAccesses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No tenés accesos confirmados todavía. Confirmá una reserva para que aparezca acá.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/reservation/${item.id}`)}>
              <View style={styles.qrWrapper}>
                <QRCode value={item.qrCode} size={160} backgroundColor={colors.textPrimary} color={colors.background} />
              </View>
              <Text style={styles.eventName}>{item.event.name}</Text>
              <Text style={styles.eventMeta}>{formatEventDateTime(new Date(item.event.startsAt))}</Text>
              <Text style={styles.tier}>Acceso {item.accessTier}</Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 4 },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  loader: { marginTop: 40 },
  empty: { color: colors.textSecondary, textAlign: "center", marginTop: 40, paddingHorizontal: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  qrWrapper: { backgroundColor: colors.textPrimary, padding: 12, borderRadius: 16, marginBottom: 8 },
  eventName: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
  eventMeta: { color: colors.textSecondary, fontSize: 13 },
  tier: { color: colors.accent, fontSize: 12, fontWeight: "600" },
});
