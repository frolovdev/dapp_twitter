import { useMemo } from 'react';

export const useCountCharacterLimit = (text: string, limit: number) => {
  return useMemo(() => limit - text.length, [text, limit]);
};
