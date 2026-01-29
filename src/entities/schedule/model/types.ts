import { TimeSlot } from "@/entities/timeSlot";

export type ScheduleDay = {
  date: string;
  slots: TimeSlot[];
};
