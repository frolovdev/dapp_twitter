import React, { useEffect } from 'react';

export const useAutoresizeTextarea = (
  element: React.MutableRefObject<HTMLTextAreaElement | null>,
) => {
  const resizeTextarea = () => {
    if (!element?.current) {
      return;
    }

    element.current.style.height = 'auto';
    element.current.style.height = element.current.scrollHeight + 'px';
  };

  useEffect(() => {
    if (!element.current) {
      return;
    }
    resizeTextarea();

    element.current.addEventListener('input', resizeTextarea);
    return () => element?.current?.removeEventListener('input', resizeTextarea);
  }, [element]);
};
