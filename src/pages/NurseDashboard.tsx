import React from "react";
import { useQuery, useMutation} from "@tanstack/react-query";
import { dietApi, type NutritionIntakeCreate } from "../api/dietApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


interface NurseDashboardProps {
  facilityId: string;
}

interface OrderForNurse {
  id: string;
  patient: { id: string; name: string };
  encounter: { id: string };
  facility: { id: string };
  products: { name: string; product_id: string; quantity: string }[];
  status: string;
}

const NurseDashboard: React.FC<NurseDashboardProps> = ({ facilityId }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["nurse_view_orders", facilityId],
    queryFn: () => dietApi.listCanteenOrders({ facility: facilityId }),
    enabled: !!facilityId,
    select: (data) => data.results,
  });

  const logIntakeMutation = useMutation({
    mutationFn: dietApi.createIntakeLog,
    onSuccess: () => {
      alert("Intake logged successfully!");
    },
  });

  const handleLogIntake = (order: OrderForNurse) => {
    const newIntake: NutritionIntakeCreate = {
      patient: order.patient.id,
      encounter: order.encounter.id,
      facility: order.facility.id,
      status: "completed",
      intake_items: order.products,
      occurrence_datetime: new Date().toISOString(),
      service_type: "food",
      status_reason: "",
      note: `Intake logged for order ${order.id}`,
    };
    logIntakeMutation.mutate(newIntake);
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Nurse: Log Patient Intake</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Patient</th>
                <th className="p-2 text-left">Order</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="p-2">{order.patient.name}</td>
                  <td className="p-2">{order.products.map(p => p.name).join(", ")}</td>
                  <td className="p-2">{order.status}</td>
                  <td className="p-2 text-right">
                    <Button onClick={() => handleLogIntake(order)}>Log Intake</Button>
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No orders to log.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default NurseDashboard;