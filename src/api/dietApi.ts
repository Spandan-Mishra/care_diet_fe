import type { NutritionOrder } from "../types/nutrition_order";
import type { Encounter } from "../types/encounter";
import type { NutritionIntake } from "../types/nutrition_intake";

export type NutritionOrderCreate = Omit<NutritionOrder, "id" | "prescribed_by" | "products"> & {
  products: string[];
};
export type NutritionIntakeCreate = Omit<NutritionIntake, "id" | "logged_by">;
export type CanteenOrderUpdate = Pick<NutritionOrder, "status">;

export const dietApi = {
  listEncounterNutritionOrders: {
    path: "/api/v1/diet/encounter-nutrition-orders/",
    method: "GET",
    TRes: {} as { results: NutritionOrder[] },
  },
  listEncountersForDietician: {
    path: "/api/v1/diet/dietician-orders/",
    method: "GET",
    TRes: {} as { results: Encounter[] },
  },
  createMealOrder: {
    path: "/api/v1/diet/dietician-meals/",
    method: "POST",
    TBody: {} as NutritionOrderCreate,
    TRes: {} as NutritionOrder,
  },
  listCanteenOrders: {
    path: "/api/v1/diet/canteen-orders/",
    method: "GET",
    TRes: {} as { results: NutritionOrder[] },
  },
  updateCanteenOrder: {
    path: (orderId: string) => `/api/v1/diet/canteen-orders/${orderId}/`,
    method: "PATCH",
    TBody: {} as CanteenOrderUpdate,
    TRes: {} as NutritionOrder,
  },
  createIntakeLog: {
    path: "/api/v1/diet/intake-logs/",
    method: "POST",
    TBody: {} as NutritionIntakeCreate,
    TRes: {} as NutritionIntake,
  },
};

export default dietApi;