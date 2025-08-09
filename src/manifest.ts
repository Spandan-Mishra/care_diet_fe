import { lazy } from "react";
import routes from "./routes";

const manifest = {
  plugin: "care_diet_fe",
  routes,
  components: {
    NutritionOrderQuestion: lazy(
      () => import("./pages/questionnaire/NutritionOrderQuestion")
    ),
  },
  encounterTabs: {
    nutrition_orders: lazy(() => import("./components/encounter-tabs/EncounterNutritionOrdersTab")),
  },
};

export default manifest;