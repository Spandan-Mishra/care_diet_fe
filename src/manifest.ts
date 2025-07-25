import { lazy } from "react";

const manifest = {
  plugin: "care_diet_fe",
  routes: {
    "/facility/:facilityId/services": lazy(() => import("./pages/ServicesPage")),
    "/facility/:facilityId/services/dietician": lazy(() => import("./pages/DieticianDashboard")),
    "/facility/:facilityId/services/canteen": lazy(() => import("./pages/CanteenDashboard")),
    "/facility/:facilityId/services/nurse": lazy(() => import("./pages/NurseDashboard")),
  },
  encounterTabs: {
    nutrition_orders: lazy(() => import("./components/encounter-tabs/NutritionOrdersTab")),
  },
};

export default manifest;