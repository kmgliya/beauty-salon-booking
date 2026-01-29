import dayjs from "dayjs";
import { Specialist } from "@/entities/specialist";
import { Service } from "@/entities/service";
import { Booking } from "@/entities/booking";
import { TimeSlot } from "@/entities/timeSlot";
import { setTime, toISO } from "@/shared/lib/date";

type SlotLock = {
  timeSlotId: string;
  specialistId: string;
  startTime: string;
  endTime: string;
  lockedByUserId: string;
};

type GenerateScheduleInput = {
  dateISO: string;
  specialist: Specialist;
  service: Service;
  bookings: Booking[];
  locks: SlotLock[];
};

const isOverlapping = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
  return dayjs(aStart).isBefore(bEnd) && dayjs(aEnd).isAfter(bStart);
};

export const createSlotId = (specialistId: string, serviceId: string, startTime: string) =>
  `${specialistId}-${serviceId}-${dayjs(startTime).format("YYYYMMDD-HHmm")}`;

export const generateSchedule = ({
  dateISO,
  specialist,
  service,
  bookings,
  locks,
}: GenerateScheduleInput): TimeSlot[] => {
  const slotStep = service.durationMinutes;
  const bufferBefore = service.bufferBeforeMinutes;
  const bufferAfter = service.bufferAfterMinutes;

  const dayOfWeek = dayjs(dateISO).day();
  const workingHours = specialist.workingHours.filter((entry) => entry.day === dayOfWeek);

  const slots: TimeSlot[] = [];

  workingHours.forEach((hours) => {
    let cursor = setTime(dateISO, hours.start);
    const startLimit = setTime(dateISO, hours.start);
    const endLimit = setTime(dateISO, hours.end);

    while (cursor.add(slotStep, "minute").isSameOrBefore(endLimit)) {
      const serviceStart = cursor;
      const serviceEnd = cursor.add(slotStep, "minute");
      const bufferStart = serviceStart.subtract(bufferBefore, "minute");
      const bufferEnd = serviceEnd.add(bufferAfter, "minute");

      if (
        bufferStart.isBefore(startLimit) ||
        bufferEnd.isAfter(endLimit)
      ) {
        cursor = cursor.add(slotStep, "minute");
        continue;
      }

      const startTime = toISO(serviceStart);
      const endTime = toISO(serviceEnd);
      const conflictStart = toISO(bufferStart);
      const conflictEnd = toISO(bufferEnd);
      const slotId = createSlotId(specialist.id, service.id, startTime);

      const bookingConflict = bookings.find(
        (booking) =>
          booking.specialistId === specialist.id &&
          booking.status === "active" &&
          isOverlapping(conflictStart, conflictEnd, booking.startTime, booking.endTime)
      );

      const lockConflict = locks.find(
        (lock) =>
          lock.specialistId === specialist.id &&
          isOverlapping(conflictStart, conflictEnd, lock.startTime, lock.endTime)
      );

      let status: TimeSlot["status"] = "free";
      let lockedByUserId: string | undefined;

      if (bookingConflict) {
        status = "booked";
      } else if (lockConflict) {
        status = "locked";
        lockedByUserId = lockConflict.lockedByUserId;
      }

      slots.push({
        id: slotId,
        specialistId: specialist.id,
        serviceId: service.id,
        startTime,
        endTime,
        status,
        lockedByUserId,
      });

      cursor = cursor.add(slotStep, "minute");
    }
  });

  return slots;
};
