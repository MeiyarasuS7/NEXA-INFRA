import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filters?: {
    label: string;
    value: string;
    active: boolean;
    onClick: () => void;
  }[];
}

export const SearchFilter = ({ value, onChange, placeholder = "Search...", filters }: SearchFilterProps) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
    {filters && filters.map((filter) => (
      <Button
        key={filter.value}
        variant={filter.active ? "default" : "outline"}
        size="sm"
        onClick={filter.onClick}
      >
        {filter.label}
      </Button>
    ))}
  </div>
);
