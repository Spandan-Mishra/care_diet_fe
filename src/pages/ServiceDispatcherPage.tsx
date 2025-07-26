// src/pages/ServiceDispatcherPage.tsx

import React from "react";
import { usePathParams } from "raviger";
import DieticianDashboard from "./DieticianDashboard";
import CanteenDashboard from "./CanteenDashboard";
import NurseDashboard from "./NurseDashboard";

const DIETICIAN_SERVICE_ID = "11111111-1111-1111-1111-111111111111";
const CANTEEN_SERVICE_ID = "22222222-2222-2222-2222-222222222222";
const NURSE_SERVICE_ID = "33333333-3333-3333-3333-333333333333";

const SERVICE_MAP: Record<string, React.FC<{ facilityId: string }>> = {
  [DIETICIAN_SERVICE_ID]: DieticianDashboard,
  [CANTEEN_SERVICE_ID]: CanteenDashboard,
  [NURSE_SERVICE_ID]: NurseDashboard,
};

const SERVICE_ROUTE = "/facility/:facilityId/services/:serviceId";

const ServiceDispatcherPage: React.FC = () => {
  const pathParams = usePathParams(SERVICE_ROUTE);

  if (!pathParams) {
    return <div className="p-4">Loading or invalid route...</div>;
  }

  const { facilityId, serviceId } = pathParams;
  const ComponentToRender = SERVICE_MAP[serviceId];

  if (!ComponentToRender) {
    return <div className="p-4">Error: Service with ID '{serviceId}' not found.</div>;
  }

  return <ComponentToRender facilityId={facilityId} />;
};

export default ServiceDispatcherPage;