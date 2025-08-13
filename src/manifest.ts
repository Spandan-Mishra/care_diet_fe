import { lazy } from "react";
import routes from "./routes";

const manifest = {
  plugin: "care_diet_fe",
  routes,
  navItems: [
    {
      name: "Nutrition Products",
      url: "settings/nutrition_products",
    },
  ],
  components: {
    NutritionOrderQuestion: lazy(
      () => import("./pages/questionnaire/NutritionOrderQuestion")
    ),
    LocationCanteenDashboard: lazy(
      () => import("./pages/LocationCanteenDashboard")
    ),
    IntakeLogging: lazy(
      () => import("./pages/IntakeLogging")
    ),
  },
  encounterTabs: {
    nutrition_orders: lazy(() => import("./components/encounter-tabs/EncounterNutritionOrdersTab")),
  },
};

export default manifest;