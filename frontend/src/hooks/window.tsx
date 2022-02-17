import { useState, useEffect } from 'react';

export const useWindowSize = (): {
  width: number | undefined;
  height: number | undefined;
} => {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = (): void => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
};

export const scrollHorizontal = (e: any): void => {
  e.stopPropagation();
  var containerScrollPosition = e.currentTarget.scrollLeft;
  e.currentTarget.scrollTo({
    top: 0,
    left: containerScrollPosition + e.deltaY,
  });
};
