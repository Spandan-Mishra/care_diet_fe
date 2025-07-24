import React from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ServicesPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dietary Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to={`/facility/${facilityId}/services/diet/dietician`}>
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader>
              <CardTitle>Dietician View</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View patients and create new meal orders.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={`/facility/${facilityId}/services/diet/canteen`}>
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader>
              <CardTitle>Canteen View</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View and manage the status of active food orders.</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={`/facility/${facilityId}/services/diet/nurse`}>
          <Card className="hover:bg-gray-50 transition-colors">
            <CardHeader>
              <CardTitle>Nurse View</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View patient meal orders and log their intake.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default ServicesPage;