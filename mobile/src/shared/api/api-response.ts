export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
  path?: string;
};

export function unwrapApiResponse<T>(response: ApiEnvelope<T> | T): T {
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response
  ) {
    return (response as ApiEnvelope<T>).data as T;
  }

  return response as T;
}
