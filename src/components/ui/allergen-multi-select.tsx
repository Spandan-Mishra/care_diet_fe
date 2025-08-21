"use client"

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { valuesetApi, type ValueSetCoding } from "../../api/valuesetApi";

interface AllergenMultiSelectProps {
  value: ValueSetCoding[];
  onChange: (selectedAllergens: ValueSetCoding[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function AllergenMultiSelect({
  value = [],
  onChange,
  placeholder = "Select allergens...",
  disabled = false,
  className,
}: AllergenMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch allergy codes from system-allergy-code valueset
  const { data: allergenOptions = [], isLoading } = useQuery({
    queryKey: ["system-allergy-codes", search],
    queryFn: () => valuesetApi.getSystemAllergyCodes(search),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const selectedAllergenCodes = useMemo(
    () => new Set(value.map(item => item.code)),
    [value]
  );

  const handleSelect = (allergen: ValueSetCoding) => {
    if (selectedAllergenCodes.has(allergen.code)) {
      // Remove if already selected
      onChange(value.filter(item => item.code !== allergen.code));
    } else {
      // Add if not selected
      onChange([...value, allergen]);
    }
  };

  const handleRemove = (allergenCode: string) => {
    onChange(value.filter(item => item.code !== allergenCode));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Allergens</Label>
      
      {/* Selected allergens display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] bg-gray-50">
          {value.map((allergen) => (
            <Badge 
              key={allergen.code} 
              variant="secondary" 
              className="flex items-center gap-1"
            >
              {allergen.display}
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-gray-200"
                  onClick={() => handleRemove(allergen.code)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
          {!disabled && value.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Allergen selector */}
      {!disabled && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value.length === 0 
                ? placeholder 
                : `${value.length} allergen${value.length === 1 ? '' : 's'} selected`
              }
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search allergens..."
                value={search}
                onValueChange={setSearch}
                className="border-none"
              />
              <CommandList className="max-h-[200px] overflow-y-auto">
                {isLoading ? (
                  <div className="py-6 text-center text-sm">Loading allergens...</div>
                ) : (
                  <CommandEmpty>No allergens found.</CommandEmpty>
                )}
                <CommandGroup>
                  {allergenOptions.map((allergen) => (
                    <CommandItem
                      key={allergen.code}
                      value={allergen.display}
                      onSelect={() => handleSelect(allergen)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedAllergenCodes.has(allergen.code) 
                            ? "opacity-100" 
                            : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{allergen.display}</div>
                        <div className="text-xs text-gray-500">
                          {allergen.system} | {allergen.code}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
