import type { EventDto, GetEventResponse, ListEventsResponse } from "@heaven-pass/types";
import { api } from "../api/client";
import { useApiResource } from "./useApiResource";

export function useEvents() {
  return useApiResource<ListEventsResponse>(() => api.get<ListEventsResponse>("/events"));
}

export function useEvent(idOrSlug: string | undefined) {
  return useApiResource<EventDto>(
    () => api.get<GetEventResponse>(`/events/${idOrSlug}`),
    [idOrSlug],
  );
}
