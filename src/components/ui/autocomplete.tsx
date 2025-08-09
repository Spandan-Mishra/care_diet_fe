"use client"

import { CaretSortIcon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import * as React from "react";

import { cn } from "../../lib/utils";

import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface AutoCompleteOption {
  label: string;
  value: string;
}

interface AutocompleteProps {
  options: AutoCompleteOption[];
  isLoading?: boolean;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  inputPlaceholder?: string;
  noOptionsMessage?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  className?: string;
  popoverClassName?: string;
  closeOnSelect?: boolean;
  showClearButton?: boolean;
  "data-cy"?: string;
}

export default function Autocomplete({
  options,
  isLoading = false,
  value,
  onChange,
  onSearch,
  placeholder = "Select...",
  inputPlaceholder = "Search option...",
  noOptionsMessage = "No options found",
  disabled,
  align = "center",
  className,
  popoverClassName,
  closeOnSelect = true,
  showClearButton = true,
  "data-cy": dataCy,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);

  // Find a matching option from the options list
  const selectedOption = options.find((option) => option.value === value);

  // Handle changes in the CommandInput
  const handleInputChange = (newValue: string) => {
    if (onSearch) {
      onSearch(newValue);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onChange("");
    onSearch?.("");
    setOpen(false);
  };

  const commandContent = (
    <>
      <CommandInput
        placeholder={inputPlaceholder}
        disabled={disabled}
        onValueChange={handleInputChange}
        className="outline-hidden border-none ring-0 shadow-none"
        autoFocus
      />
      <CommandList className="overflow-y-auto">
        {isLoading ? (
          <div className="py-6 text-center text-sm">Loading...</div>
        ) : (
          <CommandEmpty>{noOptionsMessage}</CommandEmpty>
        )}
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={`${option.label} - ${option.value}`}
              onSelect={(v) => {
                const currentValue =
                  options.find((o) => `${o.label} - ${o.value}` === v)?.value ||
                  "";
                onChange(currentValue);
                if (closeOnSelect) {
                  setOpen(false);
                }
              }}
            >
              <CheckIcon
                className={cn(
                  "mr-2 size-4",
                  value === option.value ? "opacity-100" : "opacity-0",
                )}
              />
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={popoverClassName}>
        <Button
          title={selectedOption ? selectedOption.label : undefined}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
          data-cy={dataCy}
          onClick={() => setOpen(!open)}
        >
          <span
            className={cn(
              selectedOption && "truncate",
              !selectedOption && "text-gray-500",
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption && showClearButton ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-3 p-0 hover:bg-transparent opacity-50"
              onClick={handleClear}
              title="Clear"
            >
              <Cross2Icon className="size-3" />
              <span className="sr-only">Clear</span>
            </Button>
          ) : (
            <CaretSortIcon className="ml-2 size-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-full min-w-[var(--radix-popover-trigger-width)]"
        align={align}
        sideOffset={4}
      >
        <Command className="w-full">{commandContent}</Command>
      </PopoverContent>
    </Popover>
  );
}
