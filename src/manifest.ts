import { lazy } from "react";

const manifest = {
  plugin: "care_diet_fe",
  routes: {
    "/facility/:facilityId/services": lazy(() => import("./pages/services")),
  },
  encounterTabs: {
    nutrition_orders: lazy(() => import("./components/encounter-tabs/NutritionOrdersTab")),
  },
};

export default manifest;