"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useServicesQuery, useSpecialistsQuery, useScheduleQuery, useUserBookingsQuery } from "@/shared/api/hooks";
import { Card, Button, StatusBadge } from "@/shared/ui";
import { CURRENT_USER_ID, REFRESH_INTERVAL_MS } from "@/shared/config/constants";
import { formatDateFull, formatTime, dayLabel, todayISO } from "@/shared/lib/date";
import { useCancelBookingMutation } from "@/features/cancel-booking/model/useCancelBooking";
import { useRescheduleBookingMutation } from "@/features/reschedule-booking/model/useRescheduleBooking";
import { useBookingFlowStore } from "@/shared/store/bookingFlow";

export const UserBookings = () => {
  const { data: bookings, isLoading } = useUserBookingsQuery(CURRENT_USER_ID);
  const { data: services } = useServicesQuery();
  const { data: specialists } = useSpecialistsQuery();
  const cancelMutation = useCancelBookingMutation();
  const { startRepeatBooking } = useBookingFlowStore();

  const active = useMemo(
    () =>
      bookings?.filter(
        (booking) =>
          booking.status === "active" &&
          dayjs(booking.endTime).isAfter(dayjs())
      ) ?? [],
    [bookings]
  );

  const past = useMemo(
    () =>
      bookings?.filter(
        (booking) =>
          booking.status !== "active" ||
          dayjs(booking.endTime).isBefore(dayjs())
      ) ?? [],
    [bookings]
  );

  if (isLoading) {
    return <Card>Загружаем ваши записи...</Card>;
  }

  return (
    <div className="stack">
      <Card>
        <div className="stack">
          <strong>Предстоящие записи</strong>
          {active.length === 0 && <span className="muted">Нет активных записей.</span>}
          {active.map((booking) => {
            const service = services?.find((item) => item.id === booking.serviceId);
            const specialist = specialists?.find(
              (item) => item.id === booking.specialistId
            );
            return (
              <Card key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="avatar">{specialist?.name?.slice(0, 1)}</div>
                  <div className="stack">
                    <strong>{service?.name}</strong>
                    <span className="muted">Мастер: {specialist?.name}</span>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="booking-meta">
                  <span>{formatDateFull(booking.startTime)}</span>
                  <span>
                    {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
                  </span>
                  <span className="muted">Bloom & Glow, Mussafah</span>
                </div>
                <div className="row booking-actions">
                  <ReschedulePanel
                    bookingId={booking.id}
                    serviceId={booking.serviceId}
                  />
                  <Button
                    variant="ghost"
                    onClick={() => cancelMutation.mutate({ bookingId: booking.id })}
                  >
                    Отменить
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="stack">
          <strong>Прошедшие записи</strong>
          {past.length === 0 && <span className="muted">История пуста.</span>}
          {past.map((booking) => {
            const service = services?.find((item) => item.id === booking.serviceId);
            const specialist = specialists?.find(
              (item) => item.id === booking.specialistId
            );
            return (
              <Card key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="avatar">{specialist?.name?.slice(0, 1)}</div>
                  <div className="stack">
                    <strong>{service?.name}</strong>
                    <span className="muted">Мастер: {specialist?.name}</span>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="booking-meta">
                  <span>{formatDateFull(booking.startTime)}</span>
                  <span>
                    {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
                  </span>
                </div>
                <div className="row booking-actions">
                  <Link
                    className="button"
                    href="/booking"
                    onClick={() =>
                      startRepeatBooking({
                        serviceId: booking.serviceId,
                        specialistId: booking.specialistId,
                        dateISO: dayjs(booking.startTime).format("YYYY-MM-DD"),
                      })
                    }
                  >
                    Повторить запись
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

const ReschedulePanel = ({
  bookingId,
  serviceId,
}: {
  bookingId: string;
  serviceId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [specialistId, setSpecialistId] = useState<string | undefined>();
  const [dateISO, setDateISO] = useState<string>(todayISO());
  const rescheduleMutation = useRescheduleBookingMutation(CURRENT_USER_ID);

  const { data: specialists } = useSpecialistsQuery(serviceId);
  const { data: schedule } = useScheduleQuery({
    serviceId,
    specialistId,
    dateISO,
    refetchInterval: REFRESH_INTERVAL_MS,
  });

  const dates = Array.from({ length: 5 }, (_, index) =>
    dayjs(todayISO()).add(index, "day").format("YYYY-MM-DD")
  );

  return (
    <div className="stack">
      <Button variant="ghost" onClick={() => setOpen((prev) => !prev)}>
        Перенести
      </Button>
      {open && (
        <Card className="soft">
          <div className="stack">
            <strong>Новое время</strong>
            <div className="row">
              {specialists?.map((specialist) => (
                <Button
                  key={specialist.id}
                  variant={specialistId === specialist.id ? "primary" : "ghost"}
                  onClick={() => setSpecialistId(specialist.id)}
                >
                  {specialist.name}
                </Button>
              ))}
            </div>
            <div className="row">
              {dates.map((date) => (
                <Button
                  key={date}
                  variant={dateISO === date ? "primary" : "ghost"}
                  onClick={() => setDateISO(date)}
                >
                  {dayLabel(date)}
                </Button>
              ))}
            </div>
            <div className="grid cols-3">
              {schedule?.slots
                .filter((slot) => slot.status === "free")
                .map((slot) => (
                  <button
                    key={slot.id}
                    className="slot free"
                    onClick={() =>
                      rescheduleMutation.mutate({
                        bookingId,
                        newSlot: {
                          timeSlotId: slot.id,
                          specialistId: slot.specialistId,
                          startTime: slot.startTime,
                          endTime: slot.endTime,
                        },
                      })
                    }
                  >
                    <strong>{formatTime(slot.startTime)}</strong>
                    <span className="muted tiny">{formatTime(slot.endTime)}</span>
                  </button>
                ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
