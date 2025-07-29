export type NutritionIntake = {
  id: string;
  patient: any;
  encounter: any;
  logged_by: any;
  facility: any;
  service_type: string;
  status: string;
  status_reason: string | null;
  intake_items: Array<{
    product_id: string;
    name?: string;
    quantity: string;
  }>;
  occurrence_datetime: string;
  note: string | null;
};