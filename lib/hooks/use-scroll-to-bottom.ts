import { useEffect, useRef, RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  
  // Disable auto-scrolling completely
  // Original implementation was causing issues with forced scrolling
  
  return [containerRef, endRef];
}
