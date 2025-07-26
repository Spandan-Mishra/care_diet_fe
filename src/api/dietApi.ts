import type { NutritionOrder } from "../types/nutrition_order";
import type { NutritionIntake } from "../types/nutrition_intake";

export type NutritionOrderCreate = Omit<NutritionOrder, "id" | "prescribed_by" | "products"> & {
  products: string[];
};
export type NutritionIntakeCreate = Omit<NutritionIntake, "id" | "logged_by">;

export const dietApi = {
  listEncounterNutritionOrders: { path: "/api/diet/encounter-nutrition-orders" },
  listDieticianOrders: { path: "/api/diet/dietician-orders/" },
  createMealOrder: { path: "/api/diet/dietician-meals/" },
  listCanteenOrders: { path: "/api/diet/canteen-orders/" },
  updateCanteenOrder: { path: (orderId: string) => `/api/diet/canteen-orders/${orderId}/` },
  createIntakeLog: { path: "/api/diet/intake-logs/" },
};