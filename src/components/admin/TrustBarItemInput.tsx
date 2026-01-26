import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Trash2 } from "lucide-react";

interface TrustBarItemInputProps {
  value: string;
  index: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

/**
 * TrustBarItemInput - Isolated component for trust bar item editing.
 * Each input has its own debounced state, preventing parent re-renders on keystroke.
 */
const TrustBarItemInput = ({ value, index, onUpdate, onRemove }: TrustBarItemInputProps) => {
  return (
    <div className="flex gap-2 items-center">
      <DebouncedInput
        value={value}
        onChange={(newValue) => onUpdate(index, newValue)}
        placeholder="Testo badge..."
        debounceMs={150}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TrustBarItemInput;
