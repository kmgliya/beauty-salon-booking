export type TimeSlotStatus = "free" | "locked" | "booked";

export type TimeSlot = {
  id: string;
  specialistId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: TimeSlotStatus;
  lockedByUserId?: string;
};
