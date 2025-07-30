import { lazy } from "react";

const manifest = {
  plugin: "care_diet_fe",
  routes: {
    "/facility/:facilityId/services/:serviceId": lazy(
      () => import("./pages/RoleBasedDispatcher")
    ),
    "/facility/:facilityId/settings/nutrition-products": lazy(
      () => import("./pages/settings/NutritionProductList")
    ),
    "/facility/:facilityId/settings/nutrition-products/new": lazy(
      () => import("./pages/settings/NutritionProductForm")
    ),
    "/facility/:facilityId/settings/nutrition-products/:productId/edit": lazy(
      () => import("./pages/settings/NutritionProductForm")
    ),
  },
  encounterTabs: {
    nutrition_orders: lazy(() => import("./components/encounter-tabs/NutritionOrdersTab")),
  },
};

export default manifest;