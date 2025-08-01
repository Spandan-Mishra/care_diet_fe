import NutritionProductForm from "./pages/settings/NutritionProductForm";
import NutritionProductList from "./pages/settings/NutritionProductList";
import NutritionProductView from "./pages/settings/NutritionProductView";

const routes = {
  "/facility/:facilityId/settings/nutrition_products/new": () => (
    <NutritionProductForm />
  ),
  "/facility/:facilityId/settings/nutrition_products":() => (
    <NutritionProductList />
  ),
  "/facility/:facilityId/settings/nutrition_products/:productId": () => (
      <NutritionProductView />
  ),
  "/facility/:facilityId/settings/nutrition_products/:productId/edit": () => (
      <NutritionProductForm />
    )
};

export default routes;