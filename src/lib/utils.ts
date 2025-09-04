import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

export function formatAllergens(allergens: any[] | undefined | null): string {
  if (!allergens || allergens.length === 0) {
    return 'None';
  }
  
  return allergens.map((allergen: any) => {
    // Handle different allergen data formats
    if (typeof allergen === 'string') {
      return allergen;
    }
    
    if (typeof allergen === 'object' && allergen) {
      // Prefer display name, fallback to code, then to string representation
      return allergen.display || allergen.code || String(allergen);
    }
    
    return String(allergen);
  }).join(', ');
} 