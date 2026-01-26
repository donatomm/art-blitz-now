import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDebouncedInput } from "@/hooks/useDebouncedInput";

interface DebouncedInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

/**
 * DebouncedInput - Drop-in replacement for Input with built-in debouncing.
 * Provides instant UI feedback while debouncing parent state updates.
 * This eliminates INP issues caused by expensive re-renders on every keystroke.
 */
export const DebouncedInput = React.forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ value, onChange, debounceMs = 150, ...props }, ref) => {
    const debounced = useDebouncedInput(value, onChange, debounceMs);
    
    return (
      <Input
        ref={ref}
        {...props}
        value={debounced.value}
        onChange={(e) => debounced.onChange(e.target.value)}
      />
    );
  }
);
DebouncedInput.displayName = "DebouncedInput";

interface DebouncedTextareaProps extends Omit<React.ComponentProps<"textarea">, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

/**
 * DebouncedTextarea - Drop-in replacement for Textarea with built-in debouncing.
 * Perfect for large content editing (e.g., HTML pages, markdown) where each
 * keystroke would otherwise trigger expensive React reconciliation.
 */
export const DebouncedTextarea = React.forwardRef<HTMLTextAreaElement, DebouncedTextareaProps>(
  ({ value, onChange, debounceMs = 150, ...props }, ref) => {
    const debounced = useDebouncedInput(value, onChange, debounceMs);
    
    return (
      <Textarea
        ref={ref}
        {...props}
        value={debounced.value}
        onChange={(e) => debounced.onChange(e.target.value)}
      />
    );
  }
);
DebouncedTextarea.displayName = "DebouncedTextarea";

/**
 * Hook to create a ref with flushSync capability for debounced inputs.
 * Use this when you need to access the debounced hook's flushSync in save handlers.
 */
export function useDebouncedRef<T extends string>(
  externalValue: T,
  onExternalChange: (value: T) => void,
  debounceMs: number = 150
) {
  return useDebouncedInput(externalValue, onExternalChange as (value: string) => void, debounceMs);
}
