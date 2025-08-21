import { request, queryString } from "./request";

export interface ValueSetCoding {
  system: string;
  code: string;
  display: string;
}

export interface ValueSetExpansion {
  count: number;
  contains: ValueSetCoding[];
}

export interface ValueSetExpandResponse {
  expansion: ValueSetExpansion;
}

export const valuesetApi = {
  /**
   * Expand a valueset to get all available codes
   * Used for fetching allergy codes from system-allergy-code valueset
   */
  expandValueset: async (valuesetId: string, options?: {
    search?: string;
    count?: number;
    displayLanguage?: string;
  }): Promise<ValueSetCoding[]> => {
    const queryParams: Record<string, any> = {
      search: options?.search || "",
      count: options?.count || 50,
      display_language: options?.displayLanguage || "en-gb",
    };

    try {
      const response = await request<ValueSetExpandResponse>(
        `/api/v1/valueset/${valuesetId}/expand/${queryString(queryParams)}`
      );
      
      return response.expansion?.contains || [];
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
    return valuesetApi.expandValueset("system-allergy-code", {
      search,
      count: 100,
    });
  }
};
