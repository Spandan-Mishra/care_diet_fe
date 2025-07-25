export type NutritionOrder = {
  id: string;
  patient: any;
  prescribed_by: any;
  facility: any;
  location: any;
  encounter: any;
  service_type: string;
  products: any[];
  datetime: string;
  status: string;
  schedule: { [key: string]: any }; 
  note: string | null;
};