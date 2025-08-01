import React from "react";
import { usePathParams } from "raviger";
import DieticianDashboard from "./DieticianDashboard";
import CanteenDashboard from "./CanteenDashboard";
import NurseDashboard from "./NurseDashboard";
const FOOD_SERVICE_ID = "8cf2f0b9-932a-4f79-bd74-940b0d229601";
const SERVICE_ROUTE = "/facility/:facilityId/services/:serviceId/dashboard";

const RoleBasedDispatcherPage: React.FC = () => {
  const pathParams = usePathParams(SERVICE_ROUTE);
  const userType = localStorage.getItem("userType")
  
  if (!pathParams) {
    return <div className="p-4">Loading user data...</div>;
  }

  const { facilityId, serviceId } = pathParams;

  if (serviceId !== FOOD_SERVICE_ID) {
    return <div className="p-4">This service is not a diet service.</div>;
  }
  switch (userType) {
    case "Dietician":
        return <DieticianDashboard facilityId={facilityId} />;

    case "Canteen Staff":
      return <CanteenDashboard facilityId={facilityId} />;

    case "Nurse":
      return <NurseDashboard facilityId={facilityId} />;

    default:
      return <div className="p-4">You do not have a role assigned for the Food Service.</div>;
  }
};

export default RoleBasedDispatcherPage;