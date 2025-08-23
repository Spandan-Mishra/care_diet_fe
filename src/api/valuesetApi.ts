import { request } from "./request";

export interface ValueSetCoding {
  system: string;
  code: string;
  display: string;
}

export interface ValueSetExpandResponse {
  results: ValueSetCoding[];
}

// Common allergens as fallback if API fails
const COMMON_ALLERGENS: ValueSetCoding[] = [
  { system: "http://snomed.info/sct", code: "227493005", display: "Cashew nut" },
  { system: "http://snomed.info/sct", code: "735029006", display: "Walnut" },
  { system: "http://snomed.info/sct", code: "735030001", display: "Pecan nut" },
  { system: "http://snomed.info/sct", code: "735043008", display: "Almond" },
  { system: "http://snomed.info/sct", code: "735211005", display: "Hazelnut" },
  { system: "http://snomed.info/sct", code: "735029006", display: "Brazil nut" },
  { system: "http://snomed.info/sct", code: "226757000", display: "Peanut" },
  { system: "http://snomed.info/sct", code: "102263004", display: "Eggs" },
  { system: "http://snomed.info/sct", code: "3718001", display: "Cow's milk" },
  { system: "http://snomed.info/sct", code: "735124008", display: "Wheat" },
  { system: "http://snomed.info/sct", code: "735123002", display: "Soy" },
  { system: "http://snomed.info/sct", code: "735071009", display: "Fish" },
  { system: "http://snomed.info/sct", code: "735029006", display: "Shellfish" },
];

export const valuesetApi = {
  /**
   * Expand a valueset to get all available codes
   * Used for fetching allergy codes from system-allergy-code valueset
   */
  expandValueset: async (valuesetId: string, options?: {
    search?: string;
    count?: number;
  }): Promise<ValueSetCoding[]> => {
    const body = {
      search: options?.search || "",
      count: options?.count || 20,
    };

    try {
      const response = await request<ValueSetExpandResponse>(
        `/api/v1/valueset/${valuesetId}/expand/`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
      
      return response.results || [];
    } catch (error) {
      console.error(`Failed to expand valueset ${valuesetId}:`, error);
      return [];
    }
  },

  /**
   * Get system allergy codes specifically
   * This is the valueset used by the allergy system in Care
   */
  getSystemAllergyCodes: async (search?: string) => {
    try {
      // First try the correct allergy valueset
      let results = await valuesetApi.expandValueset("system-allergy-code", {
        search,
        count: 20,
      });
      
      // If API returns results, use them
      if (results.length > 0) {
        return results;
      }
      
      // If no results from API but no error, filter common allergens by search
      if (search) {
        return COMMON_ALLERGENS.filter(allergen => 
          allergen.display.toLowerCase().includes(search.toLowerCase()) ||
          allergen.code.includes(search)
        );
      }
      
      return COMMON_ALLERGENS;
    } catch (error) {
      console.error("Failed to fetch system allergy codes, using fallback:", error);
      
      // Fallback to common allergens if API fails
      if (search) {
        return COMMON_ALLERGENS.filter(allergen => 
          allergen.display.toLowerCase().includes(search.toLowerCase()) ||
          allergen.code.includes(search)
        );
      }
      
      return COMMON_ALLERGENS;
    }
  }
};
