import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";
import { queryKeys } from "@/shared/lib/queryKeys";

export const useServicesQuery = () =>
  useQuery({
    queryKey: queryKeys.services,
    queryFn: api.getServices,
  });

export const useSpecialistsQuery = (serviceId?: string) =>
  useQuery({
    queryKey: queryKeys.specialists(serviceId),
    queryFn: () => api.getSpecialists(serviceId),
    enabled: serviceId !== null,
  });

export const useScheduleQuery = (params: {
  serviceId?: string;
  specialistId?: string;
  dateISO?: string;
  refetchInterval?: number;
}) =>
  useQuery({
    queryKey: queryKeys.schedule({
      serviceId: params.serviceId,
      specialistId: params.specialistId,
      dateISO: params.dateISO,
    }),
    queryFn: () =>
      api.getSchedule({
        dateISO: params.dateISO!,
        serviceId: params.serviceId!,
        specialistId: params.specialistId!,
      }),
    enabled: Boolean(params.serviceId && params.specialistId && params.dateISO),
    placeholderData: (previous) => previous,
    refetchInterval: params.refetchInterval,
  });

export const useUserBookingsQuery = (userId: string) =>
  useQuery({
    queryKey: queryKeys.bookings(userId),
    queryFn: () => api.getUserBookings(userId),
  });

export const useUserQuery = (userId: string) =>
  useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => api.getUser(userId),
  });
