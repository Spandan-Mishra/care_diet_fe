// src/components/dashboards/DieticianDashboard.tsx

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dietApi, type NutritionOrderCreate } from "../api/dietApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CANTEEN_LOCATION_ID = "13aa9d8a-838e-4435-9ed2-1af3b3945fb5";

interface DieticianDashboardProps {
  facilityId: string;
}

interface EncounterForDietician {
  id: string;
  patient: { id: string; name: string };
  current_location: { id: string };
  status: string;
}

const DieticianDashboard: React.FC<DieticianDashboardProps> = ({ facilityId }) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dietician_pending_orders", facilityId],
    queryFn: async () => {
      const params = new URLSearchParams({ facility: facilityId });
      const res = await fetch(`${dietApi.listDieticianOrders.path}?${params}`);
      if (!res.ok) throw new Error("Failed to fetch encounters");
      return res.json() as Promise<{ results: EncounterForDietician[] }>;
    },
    enabled: !!facilityId,
  });

  const createOrderMutation = useMutation({
    mutationFn: (newOrder: NutritionOrderCreate) =>
      fetch(dietApi.createMealOrder.path, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(newOrder),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create order");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietician_pending_orders", facilityId] });
      alert("Order created successfully!");
    },
  });

  const handleCreateOrder = (encounter: EncounterForDietician) => {
    const productUUID = "c2e0f97f-9c68-4f57-9975-9befee199135";
    if (productUUID === "c2e0f97f-9c68-4f57-9975-9befee199135") {
      alert("Developer Action: Set a valid product UUID in DieticianDashboard.tsx");
      return;
    }

    createOrderMutation.mutate({
      encounter: encounter.id,
      patient: encounter.patient.id,
      facility: facilityId,
      location: CANTEEN_LOCATION_ID,
      service_type: "food",
      products: [productUUID],
      datetime: new Date().toISOString(),
      status: "active",
      schedule: { start_time: "09:00", frequency: "daily" },
      note: "Initial meal order.",
    });
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
                {data?.results?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No patients are currently waiting for a nutrition order.
                    </td>
                  </tr>
                )}
                {data?.results?.map((encounter) => (
                  <tr key={encounter.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{encounter.patient?.name || "N/A"}</td>
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