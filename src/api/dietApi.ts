import type { NutritionOrder } from "../types/nutrition_order";
import type { NutritionIntake } from "../types/nutrition_intake";

export type NutritionOrderCreate = Omit<NutritionOrder, "id" | "prescribed_by" | "products"> & {
  products: string[];
};
export type NutritionIntakeCreate = Omit<NutritionIntake, "id" | "logged_by">;

export const dietApi = {
  listEncounterNutritionOrders: { path: "/api/care_diet/encounter-nutrition-orders" },
  listDieticianOrders: { path: "/api/care_diet/dietician-orders/" },
  createMealOrder: { path: "/api/care_diet/dietician-meals/" },
  listCanteenOrders: { path: "/api/care_diet/canteen-orders/" },
  updateCanteenOrder: { path: (orderId: string) => `/api/care_diet/canteen-orders/${orderId}/` },
  createIntakeLog: { path: "/api/care_diet/intake-logs/" },
  products: { path: "/api/care_diet/products/" }
};