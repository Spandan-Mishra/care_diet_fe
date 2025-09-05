import type { ChargeItemDefinitionRead } from "../../../../src/types/billing/chargeItemDefinition/chargeItemDefinition";
import type { ChargeItemRead } from "../../../../src/types/billing/chargeItem/chargeItem";
import { request, queryString } from "./request";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const billingApi = {
  // ChargeItemDefinition APIs
  listChargeItemDefinitions: async (query: { facility?: string; status?: string }) => {
    return await request<PaginatedResponse<ChargeItemDefinitionRead>>(
      `/api/care_diet/charge_item_definition/${queryString(query)}`
    );
  },

  retrieveChargeItemDefinition: async (id: string) => {
    return await request<ChargeItemDefinitionRead>(`/api/care_diet/charge_item_definition/${id}/`);
  },

  // ChargeItem APIs
  listChargeItems: async (query: { 
    facility?: string; 
    service_resource?: string; 
    service_resource_id?: string;
    encounter?: string;
  }) => {
    return await request<PaginatedResponse<ChargeItemRead>>(
      `/api/care_diet/charge_item/${queryString(query)}`
    );
  },

  retrieveChargeItem: async (id: string) => {
    return await request<ChargeItemRead>(`/api/care_diet/charge_item/${id}/`);
  },

  // Get charge items for a specific nutrition order
  getNutritionOrderChargeItems: async (nutritionOrderId: string) => {
    return await request<PaginatedResponse<ChargeItemRead>>(
      `/api/care_diet/charge_item/${queryString({
        service_resource: "nutrition_order",
        service_resource_id: nutritionOrderId
      })}`
    );
  },
};
