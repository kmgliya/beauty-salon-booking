export type BookingStatus = "active" | "cancelled" | "completed";

export type Booking = {
  id: string;
  serviceId: string;
  specialistId: string;
  timeSlotId: string;
  clientId: string;
  status: BookingStatus;
  createdAt: string;
  startTime: string;
  endTime: string;
};
