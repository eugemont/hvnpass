import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { PartyCard } from "../../src/components/PartyCard";
import { Screen } from "../../src/components/Screen";
import { useEvents } from "../../src/hooks/useEvents";
import { colors } from "../../src/theme/colors";

export default function CatalogScreen() {
  const router = useRouter();
  const { data, error, isLoading, refetch } = useEvents();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Catálogo de fiestas</Text>
        <Text style={styles.subtitle}>Reservá tus accesos por orden de llegada — cupos limitados.</Text>
      </View>

      {isLoading && !data ? (
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.accent} />}
          renderItem={({ item }) => (
            <PartyCard event={item} onPress={() => router.push(`/event/${item.id}`)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={<Text style={styles.empty}>No hay fiestas publicadas todavía.</Text>}
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
  error: { color: colors.danger, textAlign: "center", marginTop: 40 },
  empty: { color: colors.textSecondary, textAlign: "center", marginTop: 40 },
});
