// src/components/dashboards/DieticianDashboard.tsx

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dietApi, type NutritionOrderCreate } from "../api/dietApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


const CANTEEN_LOCATION_ID = "b4a82529-0608-4f03-9b49-99a0c9e692ab";

interface DieticianDashboardProps {
  facilityId: string;
}

interface EncounterForDietician {
  id: string;
  patient_name: string;
  patient_id: string;
  current_location_id: string;
  status: string;
}

const DieticianDashboard: React.FC<DieticianDashboardProps> = ({ facilityId }) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dietician_pending_orders", facilityId],
    queryFn: () => dietApi.listDieticianOrders({ facility: facilityId }),
    enabled: !!facilityId,
    select: (data) => (data.results as unknown) as EncounterForDietician[],
  });

  const createOrderMutation = useMutation({
    mutationFn: dietApi.createMealOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietician_pending_orders", facilityId] });
      alert("Nutrition order created successfully!");
    },
  });

  const handleCreateOrder = (encounter: EncounterForDietician) => {
    const productUUID = "4c199a82-a6d3-4718-aedf-7627ecd36683";
    if (productUUID === "4c199a82-a6d3-4718-aedf-7627ecd36683") {
      alert("Developer Action: Set a valid product UUID in DieticianDashboard.tsx");
      return;
    }

    const newOrder: NutritionOrderCreate = {
      encounter: encounter.id,
      patient: encounter.patient_id,
      facility: facilityId,
      location: CANTEEN_LOCATION_ID,
      service_type: "food",
      products: [productUUID],
      datetime: new Date().toISOString(),
      status: "active",
      schedule: { time: "09:00", frequency: "daily" },
      note: "Initial meal order.",
    };

    createOrderMutation.mutate(newOrder);
  };

  if (isLoading) return <div className="p-4">Loading encounters...</div>;

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader><CardTitle>Patients Requiring Nutrition Plan</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Encounter Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No patients are currently waiting for a nutrition order.
                    </td>
                  </tr>
                )}
                {data?.map((encounter) => (
                  <tr key={encounter.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{encounter.patient_name || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{encounter.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        onClick={() => handleCreateOrder(encounter)}
                        disabled={createOrderMutation.isPending}
                      >
                        {createOrderMutation.isPending ? "Creating..." : "Create Meal Order"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DieticianDashboard;