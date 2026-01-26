import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  order: number;
}

interface MenuItemRowProps {
  item: NavItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (index: number, field: "label" | "href", value: string) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

/**
 * MenuItemRow - Isolated component for menu item editing.
 * Each row has its own debounced inputs, preventing parent re-renders on keystroke.
 */
const MenuItemRow = ({
  item,
  index,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: MenuItemRowProps) => {
  return (
    <div className="flex gap-2 items-center p-3 bg-muted rounded-md">
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onMoveUp(index)}
          disabled={isFirst}
        >
          <ArrowUp className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onMoveDown(index)}
          disabled={isLast}
        >
          <ArrowDown className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex-1 space-y-2">
        <DebouncedInput
          value={item.label}
          onChange={(value) => onUpdate(index, "label", value)}
          placeholder="Etichetta menu"
          className="h-8"
          debounceMs={150}
        />
        <DebouncedInput
          value={item.href}
          onChange={(value) => onUpdate(index, "href", value)}
          placeholder="/slug-pagina"
          className="h-8 font-mono text-sm"
          debounceMs={150}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MenuItemRow;
