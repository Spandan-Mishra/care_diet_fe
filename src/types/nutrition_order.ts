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
  patient_allergies?: Array<{
    id: string;
    code: {
      display: string;
      system: string;
      code: string;
    };
    category: "food" | "medication" | "environment" | "biologic";
    criticality: "low" | "high" | "unable_to_assess";
    clinical_status: "active" | "inactive" | "resolved";
    verification_status: string;
    captured_at: string; // When these allergies were captured for this order
  }>;
};