import type { NutritionOrder } from "../types/nutrition_order";
import type { Encounter } from "../types/encounter";
import type { NutritionIntake } from "../types/nutrition_intake";
import { queryString, request } from "./request";
import type { NutritionProduct } from "../types/nutrition_product";
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type NutritionOrderCreate = Omit<NutritionOrder, "id" | "prescribed_by" | "products"> & {
  products: string[];
  patient_allergies?: Array<{
    id: string;
    code: {
      display: string;
      system: string;
      code: string;
    };
    category: "food" | "medication" | "environment" | "biologic";
    criticality: "low" | "high" | "unable_to_assess";
    clinical_status: "active" | "inactive" | "resolved";
    verification_status: string;
    captured_at: string;
  }>;
};
export type CanteenOrderUpdate = Pick<NutritionOrder, "status">;
export type NutritionIntakeCreate = Omit<NutritionIntake, "id" | "logged_by">;
export type NutritionProductCreate = Omit<
  NutritionProduct,
  "id" | "created_date" | "modified_date"
>;

export const dietApi = {
  listNutritionProducts: async (query: { facility: string; search?: string }) => {
    return await request<PaginatedResponse<NutritionProduct>>(
      `/api/care_diet/products/${queryString(query)}`
    );
  },
  createNutritionProduct: async (body: NutritionProductCreate) => {
    return await request<NutritionProduct>("/api/care_diet/products/", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  retrieveNutritionProduct: async (productId: string) => {
    return await request<NutritionProduct>(`/api/care_diet/products/${productId}/`);
  },
  updateNutritionProduct: async (productId: string, body: Partial<NutritionProductCreate>) => {
    return await request<NutritionProduct>(`/api/care_diet/products/${productId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  listEncounterNutritionOrders: async (query: { encounter: string }) => {
    return await request<PaginatedResponse<NutritionOrder>>(
      `/api/care_diet/encounter-nutrition-orders/${queryString(query)}`
    );
  },

  listDieticianOrders: async (query: { facility: string }) => {
    return await request<PaginatedResponse<Encounter>>(
      `/api/care_diet/dietician-orders/${queryString(query)}`
    );
  },
  createMealOrder: async (body: NutritionOrderCreate) => {
    return await request<NutritionOrder>("/api/care_diet/dietician-meals/", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  listCanteenOrders: async (query: { facility: string; location?: string }) => {
    return await request<PaginatedResponse<NutritionOrder>>(
      `/api/care_diet/canteen-orders/${queryString(query)}`
    );
  },
  updateCanteenOrder: async (orderId: string, body: CanteenOrderUpdate) => {
    return await request<NutritionOrder>(`/api/care_diet/canteen-orders/${orderId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  createIntakeLog: async (body: NutritionIntakeCreate) => {
    return await request<NutritionIntake>("/api/care_diet/intake-logs/", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  listIntakeLogs: async (query: { facility: string; location?: string; encounter?: string; nutrition_order?: string }) => {
    return await request<PaginatedResponse<NutritionIntake>>(
      `/api/care_diet/intake-logs/${queryString(query)}`
    );
  },
};