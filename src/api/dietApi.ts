import type { NutritionOrder } from "../types/nutrition_order";

export const dietApi = {
  listNutritionOrders: {
    path: "/diet/encounter-nutrition-orders/",
    method: "GET",
    // The response is expected to be paginated
    TRes: {} as { results: NutritionOrder[] },
  },
};

export default dietApi; 