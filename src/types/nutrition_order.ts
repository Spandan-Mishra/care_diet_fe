export interface NutritionOrder {
  id: string;
  encounter: string;
  patient: string;
  prescribed_by: string;
  facility: string;
  location: string;
  service_type: string;
  products: Array<{
    id: string;
    name: string;
  }>;
  datetime: string;
  status: string;
  schedule: string;
  note?: string;
} 