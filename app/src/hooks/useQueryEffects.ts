import { useEffect, useRef } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

type QueryEffectsOptions<TData, TError> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: (data: TData | undefined, error: TError | null) => void;
};

export function useQueryEffects<TData, TError>(
  query: UseQueryResult<TData, TError>,
  options: QueryEffectsOptions<TData, TError>,
) {
  const { onSuccess, onError, onSettled } = options;

  // 이전 상태를 추적하기 위한 ref
  const prevStateRef = useRef({
    isSuccess: false,
    isError: false,
    data: undefined as TData | undefined,
    error: null as TError | null,
  });

  useEffect(() => {
    const { isSuccess, isError, data, error } = query;
    const prevState = prevStateRef.current;

    if (isSuccess && onSuccess && !prevState.isSuccess) {
      onSuccess(data as TData);
    }

    if (isError && onError && !prevState.isError) {
      onError(error as TError);
    }

    if ((isSuccess || isError) && onSettled && !(prevState.isSuccess || prevState.isError)) {
      onSettled(data, error);
    }

    prevStateRef.current = { isSuccess, isError, data, error };
  }, [query.isSuccess, query.isError, query.data, query.error, onSuccess, onError, onSettled]);

  return query;
}
