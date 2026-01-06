import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook for debounced input that provides instant local updates
 * while debouncing the parent state update.
 * 
 * This fixes INP (Interaction to Next Paint) issues by ensuring
 * the input is immediately responsive to user typing.
 */
export function useDebouncedInput(
  externalValue: string,
  onExternalChange: (value: string) => void,
  debounceMs: number = 150
) {
  const [localValue, setLocalValue] = useState(externalValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Sync local value when external value changes (but not while typing)
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalValue(externalValue);
    }
  }, [externalValue]);

  const handleChange = useCallback(
    (value: string) => {
      isTypingRef.current = true;
      setLocalValue(value);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce the parent update
      timeoutRef.current = setTimeout(() => {
        onExternalChange(value);
        isTypingRef.current = false;
      }, debounceMs);
    },
    [onExternalChange, debounceMs]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Force sync (useful when saving)
  const flushSync = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (localValue !== externalValue) {
      onExternalChange(localValue);
    }
    isTypingRef.current = false;
  }, [localValue, externalValue, onExternalChange]);

  return {
    value: localValue,
    onChange: handleChange,
    flushSync,
  };
}
