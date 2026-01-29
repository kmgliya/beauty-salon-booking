import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/shared/api";
import { queryKeys } from "@/shared/lib/queryKeys";

export const useLockSlotMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.lockSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        return;
      }
    },
  });
};

export const useReleaseSlotLockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.releaseLock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};
