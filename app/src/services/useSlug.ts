import { useMemo } from 'react';

export const useSlug = (text: string) => {
  return useMemo(() => {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }, [text]);
};
