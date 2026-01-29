import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";
import { queryKeys } from "@/shared/lib/queryKeys";
import { Booking } from "@/entities/booking";

export const useRescheduleBookingMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.rescheduleBooking,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings(userId) });
      const previous = queryClient.getQueryData<Booking[]>(
        queryKeys.bookings(userId)
      );

      if (previous) {
        queryClient.setQueryData<Booking[]>(
          queryKeys.bookings(userId),
          previous.map((booking) =>
            booking.id === variables.bookingId
              ? {
                  ...booking,
                  specialistId: variables.newSlot.specialistId,
                  timeSlotId: variables.newSlot.timeSlotId,
                  startTime: variables.newSlot.startTime,
                  endTime: variables.newSlot.endTime,
                }
              : booking
          )
        );
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.bookings(userId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};
