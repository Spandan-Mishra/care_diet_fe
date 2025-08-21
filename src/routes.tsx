import NutritionProductForm from "./pages/settings/NutritionProductForm";
import NutritionProductList from "./pages/settings/NutritionProductList";
import NutritionProductView from "./pages/settings/NutritionProductView";

const routes = {
  "/facility/:facilityId/settings/nutrition_products/new": () => (
    <div className="diet-container">
      <NutritionProductForm />
    </div>
  ),
  "/facility/:facilityId/settings/nutrition_products":() => (
    <div className="diet-container">
      <NutritionProductList />
    </div>
  ),
  "/facility/:facilityId/settings/nutrition_products/:productId": () => (
    <div className="diet-container">
      <NutritionProductView />
    </div>
  ),
  "/facility/:facilityId/settings/nutrition_products/:productId/edit": () => (
    <div className="diet-container">
      <NutritionProductForm />
    </div>
  ),
};

export default routes;