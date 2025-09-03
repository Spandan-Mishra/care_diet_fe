"use client"

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

function AllergenMultiSelect({
  value = [],
  onChange,
  placeholder = "Select allergens...",
  disabled = false,
  className,
}: AllergenMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch allergy codes from system-allergy-code valueset
  const { data: allergenOptions = [], isLoading, error } = useQuery({
    queryKey: ["system-allergy-codes", search],
    queryFn: () => valuesetApi.getSystemAllergyCodes(search),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once to avoid too many failed requests
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className={cn("space-y-2 w-full", className)} ref={dropdownRef}>
      <Label>Allergens</Label>
      
      {/* Selected allergens display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] bg-gray-50 w-full overflow-hidden">
          {value.map((allergen) => (
            <Badge 
              key={allergen.code} 
              variant="secondary" 
              className="flex items-center gap-1 text-xs"
            >
              {allergen.display}
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-gray-200"
                  onClick={() => handleRemove(allergen.code)}
                >
                  <X className="h-2 w-2" />
                </Button>
              )}
            </Badge>
          ))}
          {!disabled && value.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-[10px]"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Allergen selector */}
      {!disabled && (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-[40px] text-left text-sm"
            onClick={() => setOpen(!open)}
          >
            <span className="truncate">
              {value.length === 0 
                ? placeholder 
                : `${value.length} allergen${value.length === 1 ? '' : 's'} selected`
              }
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
          
          {open && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg h-[200px] flex flex-col">
              <div className="p-2 border-b border-gray-200 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Search allergens..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex-1 overflow-y-auto p-1 min-h-0">
                {isLoading ? (
                  <div className="py-3 text-center text-xs text-gray-500">Loading allergens...</div>
                ) : error ? (
                  <div className="py-3 text-center text-xs text-red-500">
                    Failed to load allergens. Please try again.
                  </div>
                ) : allergenOptions.length === 0 ? (
                  <div className="py-3 text-center text-xs text-gray-500">No allergens found.</div>
                ) : (
                  allergenOptions.map((allergen) => (
                    <div
                      key={allergen.code}
                      onClick={() => handleSelect(allergen)}
                      className="flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded text-xs"
                    >
                      <div className="flex items-center justify-center w-3 h-3 mr-2 flex-shrink-0">
                        {selectedAllergenCodes.has(allergen.code) && (
                          <Check className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">{allergen.display}</div>
                        <div className="text-[10px] text-gray-500 truncate">
                          {allergen.system} | {allergen.code}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AllergenMultiSelect;
