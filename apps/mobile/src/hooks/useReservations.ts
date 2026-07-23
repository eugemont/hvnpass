import type {
  AddExtraInput,
  CreateReservationInput,
  CreateReservationResponse,
  ListReservationsResponse,
  ReservationDto,
} from "@heaven-pass/types";
import { api } from "../api/client";
import { useApiResource } from "./useApiResource";
import { useAuth } from "./useAuth";

export function useReservations() {
  const { user } = useAuth();
  return useApiResource<ListReservationsResponse>(
    () => (user ? api.get<ListReservationsResponse>("/reservations") : Promise.resolve([])),
    [user?.id],
  );
}

export function useReservation(id: string | undefined) {
  return useApiResource<ReservationDto>(() => api.get<ReservationDto>(`/reservations/${id}`), [id]);
}

export function createReservation(input: CreateReservationInput) {
  return api.post<CreateReservationResponse>("/reservations", input);
}

export function confirmReservation(id: string) {
  return api.post<ReservationDto>(`/reservations/${id}/confirm`);
}

export function cancelReservation(id: string, reason?: string) {
  return api.post<ReservationDto>(`/reservations/${id}/cancel`, reason ? { reason } : undefined);
}

export function addReservationExtra(id: string, input: AddExtraInput) {
  return api.post<ReservationDto>(`/reservations/${id}/extras`, input);
}
