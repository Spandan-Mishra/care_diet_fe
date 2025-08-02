import { lazy } from "react";
import routes from "./routes";
import { NutritionOrderQuestion } from "./pages/questionnaire/NutritionOrderQuestion";

const manifest = {
  plugin: "care_diet_fe",
  routes,
  questions: {
    nutrition_order: {
      component: NutritionOrderQuestion,
    },
  },
  encounterTabs: {
    nutrition_orders: lazy(() => import("./components/encounter-tabs/EncounterNutritionOrdersTab")),
  },
};

export default manifest;