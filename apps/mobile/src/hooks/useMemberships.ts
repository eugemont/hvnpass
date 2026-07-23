import type { ListMembershipsResponse, MembershipPlan, PurchaseMembershipResponse } from "@heaven-pass/types";
import { api } from "../api/client";
import { useApiResource } from "./useApiResource";
import { useAuth } from "./useAuth";

export function useMemberships() {
  const { user } = useAuth();
  return useApiResource<ListMembershipsResponse>(
    () => (user ? api.get<ListMembershipsResponse>("/memberships") : Promise.resolve([])),
    [user?.id],
  );
}

export function purchaseMembership(plan: MembershipPlan) {
  return api.post<PurchaseMembershipResponse>("/memberships", { plan });
}
