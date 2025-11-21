import { QueryClient, DefaultOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";


const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },
  mutations: {
    retry: 0,
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions,
  });
}


let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return createQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient();
    }
    return browserQueryClient;
  }
}
