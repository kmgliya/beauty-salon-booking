"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { useServicesQuery, useSpecialistsQuery, useScheduleQuery } from "@/shared/api/hooks";
import { api } from "@/shared/api";
import { useBookingFlowStore } from "@/shared/store/bookingFlow";
import { Button, Card, StatusBadge } from "@/shared/ui";
import { dayLabel, todayISO } from "@/shared/lib/date";
import { CURRENT_USER_ID, REFRESH_INTERVAL_MS } from "@/shared/config/constants";
import {
  useLockSlotMutation,
  useReleaseSlotLockMutation,
} from "@/features/lock-slot/model/useLockSlot";

export const SpecialistSchedule = () => {
  const {
    serviceId,
    specialistId,
    setSpecialist,
    dateISO,
    setDate,
    setSlot,
    slotId,
    setLock,
  } = useBookingFlowStore();
  const [message, setMessage] = useState<string | null>(null);
  const [autoMessage, setAutoMessage] = useState<string | null>(null);
  const autoSearchRef = useRef(false);

  const { data: specialists, isLoading: loadingSpecialists } = useSpecialistsQuery(
    serviceId
  );
  const { data: services } = useServicesQuery();
  const service = services?.find((item) => item.id === serviceId);

  const dateMin = useMemo(() => dayjs().format("YYYY-MM-DD"), []);
  const dateMax = useMemo(
    () => dayjs().add(14, "day").format("YYYY-MM-DD"),
    []
  );

  useEffect(() => {
    if (!dateISO) {
      setDate(todayISO());
    }
  }, [dateISO, setDate]);

  useEffect(() => {
    const runAutoSearch = async () => {
      if (!serviceId || !specialistId || !dateISO || !schedule) return;
      if (schedule.slots.length > 0) {
        setAutoMessage(null);
        return;
      }
      if (autoSearchRef.current) return;
      autoSearchRef.current = true;
      setAutoMessage("Ищем ближайшую доступную дату...");

      const base = dayjs(dateISO);
      for (let i = 1; i <= 14; i += 1) {
        const candidate = base.add(i, "day").format("YYYY-MM-DD");
        try {
          const next = await api.getSchedule({
            dateISO: candidate,
            serviceId,
            specialistId,
          });
          if (next.slots.length > 0) {
            setDate(candidate);
            setAutoMessage(null);
            autoSearchRef.current = false;
            return;
          }
        } catch {
          // ignore and keep searching
        }
      }

      setAutoMessage("На ближайшие 14 дней нет свободных слотов.");
      autoSearchRef.current = false;
    };

    runAutoSearch();
  }, [serviceId, specialistId, dateISO, schedule, setDate]);

  const { data: schedule, isLoading: loadingSchedule } = useScheduleQuery({
    serviceId,
    specialistId,
    dateISO,
    refetchInterval: REFRESH_INTERVAL_MS,
  });

  const lockMutation = useLockSlotMutation();
  const releaseMutation = useReleaseSlotLockMutation();

  const handleSlot = async (slot: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    lockedByUserId?: string;
  }) => {
    if (!serviceId || !specialistId) return;
    setMessage(null);

    if (slot.status !== "free" && slot.lockedByUserId !== CURRENT_USER_ID) {
      setMessage("Слот недоступен. Попробуйте выбрать другой.");
      return;
    }

    if (slotId && slotId !== slot.id) {
      releaseMutation.mutate({
        timeSlotId: slotId,
        userId: CURRENT_USER_ID,
      });
    }

    try {
      const result = await lockMutation.mutateAsync({
        timeSlotId: slot.id,
        specialistId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        userId: CURRENT_USER_ID,
      });
      setSlot(slot.id, slot.startTime, slot.endTime);
      setLock(result.expiresAt);
    } catch (error) {
      setMessage("Не удалось заблокировать слот. Повторите попытку.");
    }
  };

  const suggestedSlots = useMemo(() => {
    const slots = schedule?.slots.filter((slot) => slot.status === "free") ?? [];
    if (slots.length === 0) return [];
    const mid = slots[Math.floor(slots.length / 2)];
    const early = slots[0];
    const late = slots[slots.length - 1];
    const unique = [early, mid, late].filter(
      (slot, index, self) => slot && self.findIndex((item) => item.id === slot.id) === index
    );
    return unique.slice(0, 3);
  }, [schedule]);

  const timeGroups = useMemo(() => {
    const slots = schedule?.slots ?? [];
    const early: typeof slots = [];
    const late: typeof slots = [];
    slots.forEach((slot) => {
      const hour = dayjs(slot.startTime).hour();
      if (hour < 15) {
        early.push(slot);
      } else {
        late.push(slot);
      }
    });
    return { early, late };
  }, [schedule]);

  if (!serviceId) {
    return <Card>Сначала выберите услугу.</Card>;
  }

  return (
    <div className="booking-flow">
      <Card>
        <div className="stack">
          <strong>Select Staff</strong>
          {loadingSpecialists && <span>Загрузка специалистов...</span>}
          <div className="staff-grid">
            {specialists?.map((specialist) => (
              <label
                key={specialist.id}
                className={`staff-chip ${specialistId === specialist.id ? "active" : ""}`}
              >
                <input
                  type="radio"
                  checked={specialistId === specialist.id}
                  onChange={() => setSpecialist(specialist.id)}
                />
                <span>{specialist.name}</span>
                <span className="muted tiny">
                  {specialist.level === "top" ? "TOP" : "Master"} ·{" "}
                  {service
                    ? Math.round(service.price * specialist.priceMultiplier)
                    : "—"}
                  ₽
                </span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {specialistId && (
        <Card>
          <div className="stack">
            <strong>Select Date</strong>
            <div className="date-row">
              {Array.from({ length: 7 }, (_, index) =>
                dayjs(dateMin).add(index, "day").format("YYYY-MM-DD")
              ).map((date) => (
                <button
                  key={date}
                  className={`date-chip ${dateISO === date ? "active" : ""}`}
                  onClick={() => setDate(date)}
                >
                  <span className="tiny">{dayjs(date).format("ddd")}</span>
                  <strong>{dayjs(date).format("DD")}</strong>
                  <span className="tiny">{dayjs(date).format("MMM")}</span>
                </button>
              ))}
            </div>
            <input
              className="input"
              type="date"
              min={dateMin}
              max={dateMax}
              value={dateISO ? dayjs(dateISO).format("YYYY-MM-DD") : ""}
              onChange={(event) => setDate(dayjs(event.target.value).format("YYYY-MM-DD"))}
            />
            {dateISO && <span className="muted">{dayLabel(dateISO)}</span>}
          </div>
        </Card>
      )}

      {specialistId && dateISO && (
        <Card>
          <div className="stack">
            <div className="between">
              <strong>Select Time</strong>
              <span className="tiny muted">
                Автообновление каждые {REFRESH_INTERVAL_MS / 1000} сек
              </span>
            </div>
            {loadingSchedule && <span>Обновляем расписание...</span>}
            {message && <span className="muted">{message}</span>}
            {autoMessage && <span className="muted">{autoMessage}</span>}
            {suggestedSlots.length > 0 && (
              <div className="stack">
                <span className="muted">Suggested</span>
                <div className="time-row">
                  {suggestedSlots.map((slot) => (
                    <button
                      key={slot.id}
                      className={`slot ${slot.status} ${
                        slot.id === slotId ? "selected" : ""
                      }`}
                      onClick={() => handleSlot(slot)}
                    >
                      <strong>{dayjs(slot.startTime).format("HH:mm")}</strong>
                      <span className="muted tiny">
                        {dayjs(slot.endTime).format("HH:mm")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {schedule?.slots.length === 0 && !loadingSchedule && (
              <span className="muted">
                На выбранную дату нет свободных слотов.
              </span>
            )}
            <div className="stack">
              <span className="muted">Early Hours</span>
              <div className="time-grid">
                {timeGroups.early.map((slot) => (
                  <button
                    key={slot.id}
                    className={`slot ${slot.status} ${
                      slot.id === slotId ? "selected" : ""
                    }`}
                    onClick={() => handleSlot(slot)}
                  >
                    <strong>{dayjs(slot.startTime).format("hh:mm A")}</strong>
                  </button>
                ))}
              </div>
              <span className="muted">Late Hours</span>
              <div className="time-grid">
                {timeGroups.late.map((slot) => (
                  <button
                    key={slot.id}
                    className={`slot ${slot.status} ${
                      slot.id === slotId ? "selected" : ""
                    }`}
                    onClick={() => handleSlot(slot)}
                  >
                    <strong>{dayjs(slot.startTime).format("hh:mm A")}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
