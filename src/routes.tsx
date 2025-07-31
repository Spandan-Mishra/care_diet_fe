import NutritionProductForm from "./pages/settings/NutritionProductForm";

const routes = {
  "/facility/:facilityId/settings/nutrition_products/new": () => (
    <NutritionProductForm />
  ),
};

export default routes;