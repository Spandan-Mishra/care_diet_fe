import { lazy } from "react";
import routes from "./routes";

const manifest = {
  plugin: "care_diet_fe",
  routes,
  encounterTabs: {
    nutrition_orders: lazy(() => import("./components/encounter-tabs/NutritionOrdersTab")),
  },
};

export default manifest;