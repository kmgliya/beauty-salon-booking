import { create } from "zustand";
import { persist } from "zustand/middleware";

type BookingFlowState = {
  step: 1 | 2 | 3 | 4;
  serviceId?: string;
  specialistId?: string;
  dateISO?: string;
  slotId?: string;
  slotStart?: string;
  slotEnd?: string;
  lockExpiresAt?: string;
  paymentMethod?: "card" | "cash";
  setStep: (step: BookingFlowState["step"]) => void;
  setService: (serviceId?: string) => void;
  setSpecialist: (specialistId?: string) => void;
  setDate: (dateISO?: string) => void;
  setSlot: (slotId?: string, start?: string, end?: string) => void;
  setLock: (expiresAt?: string) => void;
  setPaymentMethod: (method?: "card" | "cash") => void;
  startRepeatBooking: (params: {
    serviceId: string;
    specialistId: string;
    dateISO: string;
  }) => void;
  reset: () => void;
};

export const useBookingFlowStore = create<BookingFlowState>()(
  persist(
    (set) => ({
      step: 1,
      setStep: (step) => set({ step }),
      setService: (serviceId) =>
        set({
          serviceId,
          specialistId: undefined,
          dateISO: undefined,
          slotId: undefined,
          slotStart: undefined,
          slotEnd: undefined,
          lockExpiresAt: undefined,
          step: 2,
        }),
      setSpecialist: (specialistId) =>
        set({
          specialistId,
          dateISO: undefined,
          slotId: undefined,
          slotStart: undefined,
          slotEnd: undefined,
          lockExpiresAt: undefined,
          step: 3,
        }),
      setDate: (dateISO) => set({ dateISO }),
      setSlot: (slotId, slotStart, slotEnd) =>
        set({
          slotId,
          slotStart,
          slotEnd,
          step: slotId ? 4 : 3,
        }),
      setLock: (lockExpiresAt) => set({ lockExpiresAt }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      startRepeatBooking: ({ serviceId, specialistId, dateISO }) =>
        set({
          serviceId,
          specialistId,
          dateISO,
          slotId: undefined,
          slotStart: undefined,
          slotEnd: undefined,
          lockExpiresAt: undefined,
          paymentMethod: undefined,
          step: 3,
        }),
      reset: () =>
        set({
          step: 1,
          serviceId: undefined,
          specialistId: undefined,
          dateISO: undefined,
          slotId: undefined,
          slotStart: undefined,
          slotEnd: undefined,
          lockExpiresAt: undefined,
          paymentMethod: undefined,
        }),
    }),
    {
      name: "slotsync-booking-flow",
    }
  )
);
