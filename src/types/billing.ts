export interface ChargeItemDefinition {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "active" | "retired";
  description?: string;
  purpose?: string;
  price_components: Array<{
    type: string;
    amount: number;
    currency: string;
  }>;
}

export interface ChargeItem {
  id: string;
  title: string;
  description?: string;
  status: "planned" | "billable" | "not_billable" | "aborted" | "billed" | "paid" | "entered_in_error";
  quantity: number;
  total_price: number;
  service_resource?: string;
  service_resource_id?: string;
  note?: string;
}
