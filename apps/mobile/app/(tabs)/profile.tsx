import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { MEMBERSHIP_PLANS, MembershipPlan } from "@heaven-pass/types";
import { formatMoney } from "@heaven-pass/utils";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { StatusBadge } from "../../src/components/StatusBadge";
import { useAuth } from "../../src/hooks/useAuth";
import { useMemberships, purchaseMembership } from "../../src/hooks/useMemberships";
import { colors, planAccent } from "../../src/theme/colors";

export default function ProfileScreen() {
  const { user, isLoading: authLoading, loginWithEmail, logout } = useAuth();
  const { data: memberships, isLoading: membershipsLoading, refetch } = useMemberships();
  const [email, setEmail] = useState("demo@heavenpass.com");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<MembershipPlan | null>(null);

  async function handleLogin() {
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await loginWithEmail(email.trim());
    } catch {
      Alert.alert("No se pudo iniciar sesión", "Revisá que la API esté corriendo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePurchase(plan: MembershipPlan) {
    setPurchasingPlan(plan);
    try {
      await purchaseMembership(plan);
      refetch();
      Alert.alert("Listo", `Membresía ${MEMBERSHIP_PLANS[plan].label} activada.`);
    } catch {
      Alert.alert("No se pudo comprar la membresía", "Intentá de nuevo en unos segundos.");
    } finally {
      setPurchasingPlan(null);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Perfil</Text>

        {!user ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Iniciar sesión</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <PrimaryButton label="Entrar" onPress={handleLogin} loading={isSubmitting || authLoading} />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sesión</Text>
            <Text style={styles.email}>{user.email}</Text>
            <PrimaryButton label="Cerrar sesión" variant="outline" onPress={logout} />
          </View>
        )}

        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mis membresías</Text>
            {membershipsLoading && !memberships ? (
              <Text style={styles.subtitle}>Cargando...</Text>
            ) : memberships && memberships.length > 0 ? (
              memberships.map((m) => (
                <View key={m.id} style={[styles.membershipCard, { borderColor: planAccent[m.plan] }]}>
                  <View style={styles.membershipHeader}>
                    <Text style={[styles.membershipPlan, { color: planAccent[m.plan] }]}>
                      {MEMBERSHIP_PLANS[m.plan].label}
                    </Text>
                    <StatusBadge status={m.status} />
                  </View>
                  <Text style={styles.subtitle}>
                    {m.accessesRemaining} de {m.accessesTotal} accesos disponibles
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.subtitle}>Todavía no tenés una membresía activa.</Text>
            )}
          </View>
        )}

        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planes</Text>
            {(Object.values(MembershipPlan) as MembershipPlan[]).map((plan) => {
              const definition = MEMBERSHIP_PLANS[plan];
              return (
                <View key={plan} style={[styles.planCard, { borderColor: planAccent[plan] }]}>
                  <View style={styles.membershipHeader}>
                    <Text style={[styles.membershipPlan, { color: planAccent[plan] }]}>{definition.label}</Text>
                    <Text style={styles.planPrice}>{formatMoney(definition.basePriceCents)}</Text>
                  </View>
                  <Text style={styles.subtitle}>
                    {definition.accessesIncluded} accesos {definition.accessTier}
                  </Text>
                  <PrimaryButton
                    label={`Comprar ${definition.label}`}
                    onPress={() => handlePurchase(plan)}
                    loading={purchasingPlan === plan}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 24, paddingBottom: 48 },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: "700" },
  section: { gap: 12 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 13 },
  email: { color: colors.textPrimary, fontSize: 15 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
  },
  membershipCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  membershipHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  membershipPlan: { fontSize: 16, fontWeight: "700" },
  planCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginBottom: 12,
  },
  planPrice: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
});
