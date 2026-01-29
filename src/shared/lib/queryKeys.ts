export const queryKeys = {
  services: ["services"] as const,
  specialists: (serviceId?: string) => ["specialists", serviceId] as const,
  schedule: (params: {
    serviceId?: string;
    specialistId?: string;
    dateISO?: string;
  }) => ["schedule", params] as const,
  bookings: (userId: string) => ["bookings", userId] as const,
  user: (userId: string) => ["user", userId] as const,
};
