import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { dietApi, type NutritionIntakeCreate, type NutritionOrderCreate,  } from "@/api/dietApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { I18NNAMESPACE } from "@/types/namespace";  

interface EncounterForDietician {
  id: string;
  patient: {
    id: string;
    name: string;
  };
  current_location: {
    id: string;
  };
  status: string;
}

const DieticianDashboard: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const { t } = useTranslation(I18NNAMESPACE);
  const queryClient = useQueryClient();
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["dietician_orders", facilityId],
    queryFn: async () => {
      if (!facilityId) return { results: [] };
      const params = new URLSearchParams({ facility: facilityId });
      const res = await fetch(`${dietApi.listEncountersForDietician.path}?${params}`);
      return res.json() as Promise<{ results: EncounterForDietician[] }>;
    },
  });

  const createOrderMutation = useMutation({
     mutationFn: async (newOrder: NutritionOrderCreate) => { 
      const res = await fetch(dietApi.createMealOrder.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      if (!res.ok) {
        throw new Error("Failed to create order");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietician_orders", facilityId] });
      alert("Order created successfully!");
      setSelectedEncounterId(null); 
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleCreateOrder = (encounter: EncounterForDietician) => {
    createOrderMutation.mutate({
      encounter: encounter.id,
      patient: encounter.patient.id,
      facility: facilityId!,
      location: encounter.current_location.id,
      service_type: "food",
      products: [ "your-nutrition-product-uuid-here" ],
      datetime: new Date().toISOString(),
      status: "active",
      schedule: { start_time: "08:00", frequency: "daily" },
      note: `Meal order for patient ${encounter.patient.name}`,
    });
  };

  if (isLoading) {
    return <div className="p-6">{t("loading")}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dietician Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Patients Requiring Nutrition Plan</CardTitle>
        </CardHeader>
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