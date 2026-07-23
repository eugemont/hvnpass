import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

const STATUS_COLOR: Record<string, string> = {
  PENDING: colors.warning,
  CONFIRMED: colors.success,
  USED: colors.textSecondary,
  CANCELLED: colors.danger,
  EXPIRED: colors.danger,
  ACTIVE: colors.success,
  EXPIRED_MEMBERSHIP: colors.danger,
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  USED: "Usada",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
  ACTIVE: "Activa",
};

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? colors.textSecondary;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{STATUS_LABEL[status] ?? status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: "600" },
});
