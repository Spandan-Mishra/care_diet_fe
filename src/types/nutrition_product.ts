export type NutritionProductStatus = "active" | "inactive" | "entered-in-error";
export type NutritionProductServiceType = "food";

export interface AllergenCoding {
  system: string;
  code: string;
  display: string;
}

export type NutritionProduct = {
  id: string;
  name: string;
  code: string;
  quantity: string;
  calories: number;
  allergens: AllergenCoding[];
  status: NutritionProductStatus;
  note: string | null;
  facility: string;
  location: string;
  service_type: NutritionProductServiceType;
  charge_item_definition?: string; // UUID of ChargeItemDefinition
  created_date: string;
  modified_date: string;
};
