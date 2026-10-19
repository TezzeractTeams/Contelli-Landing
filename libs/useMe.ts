'use client';

import { useEffect, useState } from 'react';

export type MeClaims = Record<string, unknown> & {
  sub?: string;
  email?: string;
};

type UseMeResult = {
  claims: MeClaims | null;
  loading: boolean;
  error: boolean;
};

/** Fetches verified claims from /api/me; JWT fields are a display hint only. */
export function useMe(): UseMeResult {
  const [claims, setClaims] = useState<MeClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/me', { credentials: 'include' })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) {
          setClaims(null);
          setError(false);
          return;
        }
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = (await res.json()) as { claims: MeClaims };
        setClaims(data.claims);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { claims, loading, error };
}
