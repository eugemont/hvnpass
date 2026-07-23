import type { Prisma } from "@prisma/client";
import { EventStatus, type EventDto, type ListEventsQuery } from "@heaven-pass/types";
import { paginate, paginationOffset } from "@heaven-pass/utils";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import { toEventDto } from "../lib/mappers";

export async function listEvents(query: ListEventsQuery & { page: number; pageSize: number }) {
  const where: Prisma.EventWhereInput = {
    status: { in: [EventStatus.SCHEDULED, EventStatus.SOLD_OUT] },
    ...(query.city ? { city: { equals: query.city, mode: "insensitive" } } : {}),
    ...(query.from || query.to
      ? {
          startsAt: {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(query.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { slots: true },
      orderBy: { startsAt: "asc" },
      skip: paginationOffset(query.page, query.pageSize),
      take: query.pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return paginate(events.map(toEventDto), total, query.page, query.pageSize);
}

export async function getEvent(idOrSlug: string): Promise<EventDto> {
  const event = await prisma.event.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: { slots: true },
  });
  if (!event) {
    throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");
  }
  return toEventDto(event);
}
