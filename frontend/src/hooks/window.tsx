import { useState, useEffect } from 'react';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
}

export function scrollHorizontal(e: any) {
  e.stopPropagation();
  var containerScrollPosition = e.currentTarget.scrollLeft;
  e.currentTarget.scrollTo({
    top: 0,
    left: containerScrollPosition + e.deltaY,
  });
}
