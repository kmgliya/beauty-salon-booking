import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";

export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};
