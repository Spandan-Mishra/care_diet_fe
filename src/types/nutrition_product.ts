export type NutritionProductStatus = "active" | "inactive" | "entered-in-error";
export type NutritionProductServiceType = "food";
export type NutritionProduct = {
  id: string;
  name: string;
  code: string;
  quantity: string;
  calories: number;
  allergens: string[];
  status: NutritionProductStatus;
  note: string | null;
  facility: string;
  location: string;
  service_type: NutritionProductServiceType;
  created_date: string;
  modified_date: string;
};
