import axios from "axios";

export const withAxios = async <T>(fn: () => Promise<T>) => {
  const response = await axios.request<T>({
    url: "/mock",
    method: "GET",
    adapter: async (config) => {
      try {
        const data = await fn();
        return {
          data,
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      } catch (error) {
        return Promise.reject(error);
      }
    },
  });

  return response.data;
};
