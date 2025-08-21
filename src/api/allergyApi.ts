import { request, queryString } from "./request";

export interface AllergyIntolerance {
  id: string;
  code: {
    display: string;
    system: string;
    code: string;
  };
  clinical_status: "active" | "inactive" | "resolved";
  verification_status: "unconfirmed" | "confirmed" | "refuted" | "presumed" | "entered_in_error";
  category: "food" | "medication" | "environment" | "biologic";
  criticality: "low" | "high" | "unable_to_assess";
  last_occurrence?: string;
  note?: string;
  created_by: {
    id: string;
    first_name: string;
    last_name: string;
  };
  encounter: string;
  created_date: string;
  modified_date: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const allergyApi = {
  /**
   * Fetch patient's allergy history for displaying in nutrition order forms
   * Uses the same API as the main Care system
   */
  getPatientAllergies: async (patientId: string, options?: {
    encounter?: string;
    excludeVerificationStatus?: string;
    limit?: number;
  }): Promise<PaginatedResponse<AllergyIntolerance>> => {
    const queryParams: Record<string, any> = {
      limit: options?.limit || 50,
      exclude_verification_status: options?.excludeVerificationStatus || "entered_in_error",
    };

    if (options?.encounter) {
      queryParams.encounter = options.encounter;
    }

    return await request<PaginatedResponse<AllergyIntolerance>>(
      `/api/v1/patient/${patientId}/allergy_intolerance/${queryString(queryParams)}`
    );
  },

  /**
   * Get specific allergy details
   */
  getAllergyDetails: async (patientId: string, allergyId: string): Promise<AllergyIntolerance> => {
    return await request<AllergyIntolerance>(
      `/api/v1/patient/${patientId}/allergy_intolerance/${allergyId}/`
    );
  }
};
