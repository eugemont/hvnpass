import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { formatEventDateTime } from "@heaven-pass/utils";
import { Screen } from "../../src/components/Screen";
import { StatusBadge } from "../../src/components/StatusBadge";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { useAuth } from "../../src/hooks/useAuth";
import { useReservations } from "../../src/hooks/useReservations";
import { colors } from "../../src/theme/colors";

export default function ReservationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, error, isLoading, refetch } = useReservations();

  if (!user) {
    return (
      <Screen>
        <View style={styles.loggedOut}>
          <Text style={styles.title}>Iniciá sesión</Text>
          <Text style={styles.subtitle}>Iniciá sesión desde tu perfil para ver tus reservas.</Text>
          <PrimaryButton label="Ir a Perfil" onPress={() => router.push("/(tabs)/profile")} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Mis reservas</Text>
      </View>

      {isLoading && !data ? (
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.accent} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={<Text style={styles.empty}>Todavía no reservaste ninguna fiesta.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/reservation/${item.id}`)}>
              <View style={styles.cardHeader}>
                <Text style={styles.eventName} numberOfLines={1}>
                  {item.event.name}
                </Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.eventMeta}>
                {item.event.venue} · {formatEventDateTime(new Date(item.event.startsAt))}
              </Text>
              <Text style={styles.tier}>Acceso {item.accessTier}</Text>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 14, textAlign: "center" },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  loader: { marginTop: 40 },
  error: { color: colors.danger, textAlign: "center", marginTop: 40 },
  empty: { color: colors.textSecondary, textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  eventName: { color: colors.textPrimary, fontSize: 16, fontWeight: "700", flexShrink: 1 },
  eventMeta: { color: colors.textSecondary, fontSize: 13 },
  tier: { color: colors.accent, fontSize: 12, fontWeight: "600" },
  loggedOut: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
});
