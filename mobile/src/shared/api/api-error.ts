export type ApiError = {
  status?: number | string;
  message: string;
  details?: unknown;
};

type FetchBaseQueryErrorLike = {
  status?: number | string;
  data?: unknown;
  error?: string;
};

function hasMessage(value: unknown): value is { message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message?: unknown }).message === "string"
  );
}

export function toApiError(error: unknown): ApiError {
  const queryError = error as FetchBaseQueryErrorLike;

  if (queryError?.error) {
    return { status: queryError.status, message: queryError.error, details: error };
  }

  if (hasMessage(queryError?.data)) {
    return {
      status: queryError.status,
      message: queryError.data.message,
      details: queryError.data
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return {
    status: queryError?.status,
    message: "Something went wrong. Please try again.",
    details: error
  };
}
