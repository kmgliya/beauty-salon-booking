import dayjs from "dayjs";
import { Service } from "@/entities/service";
import { Specialist } from "@/entities/specialist";
import { Booking } from "@/entities/booking";
import { ScheduleDay } from "@/entities/schedule";
import { User } from "@/entities/user";
import {
  CURRENT_USER_ID,
  LOCK_MINUTES_MAX,
  LOCK_MINUTES_MIN,
} from "@/shared/config/constants";
import { generateSchedule } from "@/entities/schedule/lib/generateSchedule";
import { withAxios } from "@/shared/api/axiosTransport";

type SlotLock = {
  timeSlotId: string;
  specialistId: string;
  startTime: string;
  endTime: string;
  lockedByUserId: string;
  expiresAt: string;
};

type ApiErrorCode = "NETWORK" | "CONFLICT" | "NOT_FOUND" | "PARTIAL";

export class ApiError extends Error {
  code: ApiErrorCode;
  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const services: Service[] = [
  {
    id: "svc-color",
    name: "Окрашивание Glow",
    category: "окрашивание",
    variant: "AirTouch + уход",
    durationMinutes: 90,
    price: 4200,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
  },
  {
    id: "svc-cut",
    name: "Стрижка Luxe",
    category: "прически",
    variant: "Каскад / боб",
    durationMinutes: 60,
    price: 2500,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
  },
  {
    id: "svc-nails",
    name: "Маникюр Crystal",
    category: "маникюр",
    variant: "Гель-лак + дизайн",
    durationMinutes: 75,
    price: 3000,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
  },
  {
    id: "svc-makeup",
    name: "Визаж Aura",
    category: "макияж",
    variant: "Свадебный / вечерний",
    durationMinutes: 80,
    price: 3800,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
  },
  {
    id: "svc-pedi",
    name: "Педикюр Velvet",
    category: "педикюр",
    variant: "SPA + покрытие",
    durationMinutes: 80,
    price: 3400,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
  },
  {
    id: "svc-hair",
    name: "Укладка Blossom",
    category: "прически",
    variant: "Локоны / волны",
    durationMinutes: 70,
    price: 2800,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
  },
];

const specialists: Specialist[] = [
  {
    id: "spc-anna",
    name: "Анна",
    specialization: "Колорист",
    level: "top",
    priceMultiplier: 1.35,
    serviceIds: ["svc-color", "svc-cut"],
    workingHours: [
      { day: 1, start: "09:00", end: "20:00" },
      { day: 2, start: "09:00", end: "19:00" },
      { day: 4, start: "10:00", end: "21:00" },
      { day: 5, start: "10:00", end: "20:00" },
    ],
  },
  {
    id: "spc-mila",
    name: "Мила",
    specialization: "Нейл-мастер",
    level: "regular",
    priceMultiplier: 1.0,
    serviceIds: ["svc-nails", "svc-pedi"],
    workingHours: [
      { day: 1, start: "09:00", end: "19:00" },
      { day: 3, start: "10:00", end: "20:00" },
      { day: 5, start: "10:00", end: "19:00" },
      { day: 6, start: "10:00", end: "18:00" },
    ],
  },
  {
    id: "spc-iris",
    name: "Айрис",
    specialization: "Визажист",
    level: "top",
    priceMultiplier: 1.4,
    serviceIds: ["svc-makeup", "svc-cut"],
    workingHours: [
      { day: 2, start: "10:00", end: "20:00" },
      { day: 3, start: "10:00", end: "19:00" },
      { day: 6, start: "11:00", end: "20:00" },
      { day: 0, start: "11:00", end: "18:00" },
    ],
  },
  {
    id: "spc-dina",
    name: "Дина",
    specialization: "Парикмахер-стилист",
    level: "regular",
    priceMultiplier: 1.1,
    serviceIds: ["svc-cut", "svc-hair"],
    workingHours: [
      { day: 1, start: "10:00", end: "20:00" },
      { day: 2, start: "10:00", end: "19:00" },
      { day: 4, start: "10:00", end: "21:00" },
      { day: 6, start: "10:00", end: "18:00" },
    ],
  },
  {
    id: "spc-olga",
    name: "Ольга",
    specialization: "Нейл-мастер",
    level: "top",
    priceMultiplier: 1.25,
    serviceIds: ["svc-nails", "svc-pedi"],
    workingHours: [
      { day: 2, start: "10:00", end: "20:00" },
      { day: 3, start: "10:00", end: "19:00" },
      { day: 5, start: "10:00", end: "20:00" },
    ],
  },
  {
    id: "spc-vlada",
    name: "Влада",
    specialization: "Мастер причесок",
    level: "top",
    priceMultiplier: 1.3,
    serviceIds: ["svc-cut", "svc-hair"],
    workingHours: [
      { day: 1, start: "09:00", end: "19:00" },
      { day: 3, start: "10:00", end: "20:00" },
      { day: 6, start: "10:00", end: "19:00" },
    ],
  },
  {
    id: "spc-liza",
    name: "Лиза",
    specialization: "Визажист",
    level: "regular",
    priceMultiplier: 1.05,
    serviceIds: ["svc-makeup"],
    workingHours: [
      { day: 2, start: "10:00", end: "19:00" },
      { day: 4, start: "10:00", end: "19:00" },
      { day: 5, start: "10:00", end: "18:00" },
    ],
  },
  {
    id: "spc-nika",
    name: "Ника",
    specialization: "Нейл-мастер",
    level: "regular",
    priceMultiplier: 1.0,
    serviceIds: ["svc-nails", "svc-pedi"],
    workingHours: [
      { day: 1, start: "10:00", end: "20:00" },
      { day: 4, start: "10:00", end: "19:00" },
      { day: 6, start: "10:00", end: "18:00" },
    ],
  },
  {
    id: "spc-tina",
    name: "Тина",
    specialization: "Колорист",
    level: "regular",
    priceMultiplier: 1.15,
    serviceIds: ["svc-color"],
    workingHours: [
      { day: 2, start: "10:00", end: "20:00" },
      { day: 3, start: "10:00", end: "19:00" },
      { day: 5, start: "10:00", end: "20:00" },
    ],
  },
];

const users: User[] = [
  {
    id: CURRENT_USER_ID,
    name: "Клиентка София",
    phone: "+7 (999) 123-45-67",
  },
  {
    id: "user-02",
    name: "Екатерина",
    phone: "+7 (999) 765-43-21",
  },
];

let bookings: Booking[] = [
  {
    id: "bk-1",
    serviceId: "svc-cut",
    specialistId: "spc-anna",
    timeSlotId: "spc-anna-svc-cut-20260128-1300",
    clientId: "user-02",
    status: "active",
    createdAt: dayjs().subtract(2, "day").toISOString(),
    startTime: dayjs().add(1, "day").hour(13).minute(0).toISOString(),
    endTime: dayjs().add(1, "day").hour(14).minute(20).toISOString(),
  },
];

const locks = new Map<string, SlotLock>();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const maybeFail = (chance = 0.12) => {
  if (Math.random() < chance) {
    throw new ApiError("NETWORK", "Сеть нестабильна. Повторите попытку.");
  }
};

const maybePartialFail = (chance = 0.08) => {
  if (Math.random() < chance) {
    throw new ApiError(
      "PARTIAL",
      "Часть данных не обновилась. Обновите расписание."
    );
  }
};

const cleanupLocks = () => {
  const now = dayjs();
  Array.from(locks.values()).forEach((lock) => {
    if (dayjs(lock.expiresAt).isBefore(now)) {
      locks.delete(lock.timeSlotId);
    }
  });
};

const withSimulation = async <T>(fn: () => T, failChance?: number) => {
  await delay(randomBetween(300, 900));
  cleanupLocks();
  maybeFail(failChance);
  return fn();
};

const request = <T>(fn: () => T, failChance?: number) =>
  withAxios(() => withSimulation(fn, failChance));

export const api = {
  getServices: async () =>
    request(() => services.map((service) => ({ ...service })), 0.05),

  getSpecialists: async (serviceId?: string) =>
    request(() => {
      if (!serviceId) return specialists.map((item) => ({ ...item }));
      return specialists
        .filter((item) => item.serviceIds.includes(serviceId))
        .map((item) => ({ ...item }));
    }, 0.05),

  getSchedule: async ({
    dateISO,
    serviceId,
    specialistId,
  }: {
    dateISO: string;
    serviceId: string;
    specialistId: string;
  }): Promise<ScheduleDay> =>
    request(() => {
      const service = services.find((item) => item.id === serviceId);
      const specialist = specialists.find((item) => item.id === specialistId);
      if (!service || !specialist) {
        throw new ApiError("NOT_FOUND", "Услуга или специалист не найдены.");
      }

      const currentLocks = Array.from(locks.values());
      const slots = generateSchedule({
        dateISO,
        specialist,
        service,
        bookings,
        locks: currentLocks,
      });

      return { date: dateISO, slots };
    }),

  lockSlot: async ({
    timeSlotId,
    specialistId,
    startTime,
    endTime,
    userId,
  }: {
    timeSlotId: string;
    specialistId: string;
    startTime: string;
    endTime: string;
    userId: string;
  }) =>
    request(() => {
      const conflict = bookings.find(
        (booking) =>
          booking.specialistId === specialistId &&
          booking.status === "active" &&
          dayjs(startTime).isBefore(booking.endTime) &&
          dayjs(endTime).isAfter(booking.startTime)
      );
      if (conflict) {
        throw new ApiError("CONFLICT", "Слот уже забронирован.");
      }

      const existingLock = locks.get(timeSlotId);
      if (existingLock && existingLock.lockedByUserId !== userId) {
        throw new ApiError("CONFLICT", "Слот уже временно заблокирован.");
      }

      if (!existingLock && Math.random() < 0.18) {
        throw new ApiError("CONFLICT", "Другой клиент успел заблокировать слот.");
      }

      const duration = randomBetween(LOCK_MINUTES_MIN, LOCK_MINUTES_MAX);
      const expiresAt = dayjs().add(duration, "minute").toISOString();

      locks.set(timeSlotId, {
        timeSlotId,
        specialistId,
        startTime,
        endTime,
        lockedByUserId: userId,
        expiresAt,
      });

      return { timeSlotId, expiresAt };
    }, 0.08),

  releaseLock: async ({ timeSlotId, userId }: { timeSlotId: string; userId: string }) =>
    request(() => {
      const lock = locks.get(timeSlotId);
      if (lock && lock.lockedByUserId === userId) {
        locks.delete(timeSlotId);
      }
      return { timeSlotId };
    }, 0.05),

  createBooking: async ({
    serviceId,
    specialistId,
    timeSlotId,
    startTime,
    endTime,
    userId,
  }: {
    serviceId: string;
    specialistId: string;
    timeSlotId: string;
    startTime: string;
    endTime: string;
    userId: string;
  }) =>
    request(() => {
      const lock = locks.get(timeSlotId);
      if (!lock || lock.lockedByUserId !== userId) {
        throw new ApiError(
          "CONFLICT",
          "Слот больше не заблокирован. Выберите новое время."
        );
      }

      const newBooking: Booking = {
        id: `bk-${Math.random().toString(36).slice(2, 8)}`,
        serviceId,
        specialistId,
        timeSlotId,
        clientId: userId,
        status: "active",
        createdAt: dayjs().toISOString(),
        startTime,
        endTime,
      };

      bookings = [newBooking, ...bookings];
      locks.delete(timeSlotId);

      return newBooking;
    }),

  cancelBooking: async ({ bookingId }: { bookingId: string }) =>
    request(() => {
      const booking = bookings.find((item) => item.id === bookingId);
      if (!booking) {
        throw new ApiError("NOT_FOUND", "Бронирование не найдено.");
      }
      booking.status = "cancelled";
      maybePartialFail();
      return { bookingId };
    }),

  rescheduleBooking: async ({
    bookingId,
    newSlot,
  }: {
    bookingId: string;
    newSlot: {
      timeSlotId: string;
      specialistId: string;
      startTime: string;
      endTime: string;
    };
  }) =>
    request(() => {
      const booking = bookings.find((item) => item.id === bookingId);
      if (!booking) {
        throw new ApiError("NOT_FOUND", "Бронирование не найдено.");
      }

      const conflict = bookings.find(
        (item) =>
          item.id !== bookingId &&
          item.specialistId === newSlot.specialistId &&
          item.status === "active" &&
          dayjs(newSlot.startTime).isBefore(item.endTime) &&
          dayjs(newSlot.endTime).isAfter(item.startTime)
      );
      if (conflict) {
        throw new ApiError("CONFLICT", "Новое время уже занято.");
      }

      booking.timeSlotId = newSlot.timeSlotId;
      booking.specialistId = newSlot.specialistId;
      booking.startTime = newSlot.startTime;
      booking.endTime = newSlot.endTime;
      booking.status = "active";

      maybePartialFail();
      return booking;
    }),

  getUserBookings: async (userId: string) =>
    request(() => {
      const user = users.find((item) => item.id === userId);
      if (!user) {
        throw new ApiError("NOT_FOUND", "Пользователь не найден.");
      }
      return bookings
        .filter((booking) => booking.clientId === userId)
        .map((booking) => ({ ...booking }));
    }, 0.05),

  getUser: async (userId: string) =>
    request(() => {
      const user = users.find((item) => item.id === userId);
      if (!user) {
        throw new ApiError("NOT_FOUND", "Пользователь не найден.");
      }
      return { ...user };
    }, 0.05),
};
