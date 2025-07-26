import { lazy } from "react";

const manifest = {
  plugin: "care_diet_fe",
  routes: {
    "/facility/:facilityId/services/:serviceId": lazy(
      () => import("./pages/ServiceDispatcherPage")
    ),
  },
  encounterTabs: {
    nutrition_orders: lazy(() => import("./components/encounter-tabs/NutritionOrdersTab")),
  },
};

export default manifest;