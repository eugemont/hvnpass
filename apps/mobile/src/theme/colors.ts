import { MembershipPlan } from "@heaven-pass/types";

/** Dark, premium nightlife palette. Plan accent colors mirror the pitch deck's plan cards. */
export const colors = {
  background: "#0B0B12",
  surface: "#16161F",
  surfaceAlt: "#1F1F2C",
  border: "#2A2A38",
  textPrimary: "#F5F5F7",
  textSecondary: "#9A9AAD",
  textMuted: "#65657A",
  accent: "#9D7BFF",
  success: "#31C48D",
  danger: "#F35B6B",
  warning: "#F5B93D",
};

export const planAccent: Record<MembershipPlan, string> = {
  [MembershipPlan.BASIC]: "#31C48D",
  [MembershipPlan.VIP]: "#7C5CFF",
  [MembershipPlan.BLACK]: "#D9A441",
};
