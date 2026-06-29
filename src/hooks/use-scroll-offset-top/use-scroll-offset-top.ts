import type { RefObject } from 'react';

import { useRef, useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

/**
 * Custom hook to manage the offset top state based on scroll position.
 *
 * @param {number} [defaultValue=0] - The offset value at which the state changes.
 * @param {RefObject<HTMLElement | null>} [scrollTarget] - The scroll container to listen to. If not provided, listens to window.
 *
 * @returns {UseScrollOffsetTopReturn<T>} - An object containing:
 * - `offsetTop`: A boolean indicating whether the scroll position is past the offset.
 * - `elementRef`: A ref object to attach to the element to track its offset.
 *
 * @example
 * 1.Applies to top <header/> with window scroll
 * const { offsetTop } = useScrollOffsetTop(80);
 *
 * Or
 *
 * 2.Applies to element with window scroll
 * const { offsetTop, elementRef } = useScrollOffsetTop(80);
 * <div ref={elementRef} />
 *
 * Or
 *
 * 3.Applies to custom scroll container
 * const scrollContainerRef = useRef<HTMLDivElement | null>(null);
 * const { offsetTop } = useScrollOffsetTop(80, scrollContainerRef);
 * <div ref={scrollContainerRef} style={{ overflow: 'auto' }}>...</div>
 */

export type UseScrollOffsetTopReturn<T extends HTMLElement = HTMLElement> = {
  offsetTop: boolean;
  elementRef: RefObject<T>;
};

export function useScrollOffsetTop<T extends HTMLElement = HTMLElement>(
  defaultValue: number = 0,
  scrollTarget?: RefObject<HTMLElement | null>
): UseScrollOffsetTopReturn<T> {
  const elementRef = useRef<T>(null) as RefObject<T>;

  const [offsetTop, setOffsetTop] = useState<boolean>(false);

  const handleScroll = useCallback(() => {
    const scrollContainer = scrollTarget?.current;
    const scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;

    if (elementRef.current) {
      const elementOffsetTop = elementRef.current.offsetTop;
      // Track element offset top
      setOffsetTop(scrollY > elementOffsetTop - defaultValue);
    } else {
      // Track window/container offset top
      setOffsetTop(scrollY > defaultValue);
    }
  }, [defaultValue, scrollTarget]);

  useEffect(() => {
    handleScroll();

    const scrollContainer = scrollTarget?.current;
    const target = scrollContainer || window;

    target.addEventListener('scroll', handleScroll);

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, scrollTarget]);

  return {
    elementRef,
    offsetTop,
  };
}
