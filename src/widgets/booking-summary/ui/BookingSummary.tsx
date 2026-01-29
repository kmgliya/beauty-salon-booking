"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useServicesQuery, useSpecialistsQuery, useUserQuery } from "@/shared/api/hooks";
import { Button, Card } from "@/shared/ui";
import { useBookingFlowStore } from "@/shared/store/bookingFlow";
import { CURRENT_USER_ID } from "@/shared/config/constants";
import { useCreateBookingMutation } from "@/features/create-booking/model/useCreateBooking";
import { useReleaseSlotLockMutation } from "@/features/lock-slot/model/useLockSlot";
import { formatDateFull, formatTime } from "@/shared/lib/date";

export const BookingSummary = () => {
  const {
    serviceId,
    specialistId,
    slotId,
    slotStart,
    slotEnd,
    lockExpiresAt,
    setLock,
    reset,
    setSlot,
    paymentMethod,
    setPaymentMethod,
  } = useBookingFlowStore();

  const { data: services } = useServicesQuery();
  const { data: specialists } = useSpecialistsQuery(serviceId);
  const { data: user } = useUserQuery(CURRENT_USER_ID);

  const service = useMemo(
    () => services?.find((item) => item.id === serviceId),
    [services, serviceId]
  );
  const specialist = useMemo(
    () => specialists?.find((item) => item.id === specialistId),
    [specialists, specialistId]
  );

  const bookingMutation = useCreateBookingMutation();
  const releaseMutation = useReleaseSlotLockMutation();
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if (!lockExpiresAt) return;
    const timer = setInterval(() => {
      const diff = dayjs(lockExpiresAt).diff(dayjs(), "second");
      if (diff <= 0) {
        releaseMutation.mutate({
          timeSlotId: slotId!,
          userId: CURRENT_USER_ID,
        });
        setLock(undefined);
        setSlot(undefined, undefined, undefined);
        setCountdown("Слот освобожден");
        return;
      }
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setCountdown(`${minutes}:${String(seconds).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockExpiresAt, releaseMutation, setLock, setSlot, slotId]);

  const handleConfirm = async () => {
    if (!serviceId || !specialistId || !slotId || !slotStart || !slotEnd) return;
    await bookingMutation.mutateAsync({
      serviceId,
      specialistId,
      timeSlotId: slotId,
      startTime: slotStart,
      endTime: slotEnd,
      userId: CURRENT_USER_ID,
    });
    reset();
  };

  const handleReset = () => {
    if (slotId) {
      releaseMutation.mutate({
        timeSlotId: slotId,
        userId: CURRENT_USER_ID,
      });
    }
    reset();
  };

  if (!service || !specialist || !slotStart || !slotEnd) {
    return <Card>Заполните все шаги бронирования.</Card>;
  }

  return (
    <Card className="cart-card">
      <div className="stack">
        <div className="between">
          <strong>Cart</strong>
          {lockExpiresAt && <span className="chip">Lock: {countdown}</span>}
        </div>
        <div className="stack">
          <span className="muted">1 service</span>
          <strong>{service.name}</strong>
          <span className="muted">Staff: {specialist.name}</span>
          <span className="muted">
            Date & Time: {formatDateFull(slotStart)} · {formatTime(slotStart)}
          </span>
          <div className="between">
            <span>Total</span>
            <strong>
              {specialist
                ? Math.round(service.price * specialist.priceMultiplier)
                : service.price}{" "}
              ₽
            </strong>
          </div>
        </div>
        <div className="stack">
          <strong>Способ оплаты</strong>
          <label className="row">
            <input
              type="radio"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
            />
            Карта онлайн
          </label>
          <label className="row">
            <input
              type="radio"
              checked={paymentMethod === "cash"}
              onChange={() => setPaymentMethod("cash")}
            />
            Наличные на месте
          </label>
        </div>
        <div className="row">
          <Button
            onClick={handleConfirm}
            disabled={bookingMutation.isLoading || !paymentMethod}
          >
            Book Now
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
};
