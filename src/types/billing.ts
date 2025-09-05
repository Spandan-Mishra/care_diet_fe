import type { ChargeItemDefinitionRead } from "../../../../src/types/billing/chargeItemDefinition/chargeItemDefinition";
import type { ChargeItemRead } from "../../../../src/types/billing/chargeItem/chargeItem";

export interface ChargeItemDefinitionApi {
  list: (query: { facility?: string; status?: string }) => Promise<{ results: ChargeItemDefinitionRead[] }>;
  retrieve: (id: string) => Promise<ChargeItemDefinitionRead>;
}

export interface ChargeItemApi {
  list: (query: { 
    facility?: string; 
    service_resource?: string; 
    service_resource_id?: string;
    encounter?: string;
  }) => Promise<{ results: ChargeItemRead[] }>;
  retrieve: (id: string) => Promise<ChargeItemRead>;
}
