import React, { useState } from "react";
import type { Encounter } from "../../types/encounter";
import type { PatientRead } from "../../types/patient";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../ui/card";
import { dietApi } from "../../api/dietApi";
import type { NutritionOrder } from "../../types/nutrition_order";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { I18NNAMESPACE } from "../../types/namespace";
import { Button } from "@/components/ui/button";
import NutritionOrderQuestion  from "../../pages/questionnaire/NutritionOrderQuestion";

const nutritionTabQueryClient = new QueryClient();

interface PluginEncounterTabProps {
  encounter: Encounter;
  patient: PatientRead;
}

const NutritionOrdersTabInner: React.FC<PluginEncounterTabProps> = ({ encounter, patient }) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const [isCreating, setIsCreating] = useState(false); // State to toggle the form view

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["nutrition_orders", encounter.id],
    queryFn: () => dietApi.listEncounterNutritionOrders({ encounter: encounter.id }),
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4 text-red-600">Error: {error.message}</div>;

  const orders = data?.results || [];

  return (
    <div className="diet-container p-4">
      {/* --- THIS IS THE KEY CHANGE --- */}
      {isCreating ? (
        // When 'isCreating' is true, show the form.
        <div>
          <h3 className="text-lg font-semibold mb-2">Add New Nutrition Order</h3>
          <NutritionOrderQuestion
            facilityId={"2c50ae47-bea8-48e1-be5d-27daf87a1a89"}
            patientId={patient.id}
            encounterId={encounter.id}
            onSuccess={() => setIsCreating(false)} // Callback to close the form
          />
          <Button variant="outline" onClick={() => setIsCreating(false)} className="mt-4">
            Cancel
          </Button>
        </div>
      ) : (
        // When 'isCreating' is false, show the list and the "Add New" button.
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsCreating(true)}>
              Add New Nutrition Order
            </Button>
          </div>
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                {t("no_nutrition_orders_found")}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
              {orders.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4">{order.products.map((p) => p.name).join(", ")}</td>
                        <td className="px-6 py-4 capitalize">{order.status}</td>
                        <td className="px-6 py-4">{order.schedule?.frequency || "-"}</td>
                        <td className="px-6 py-4">{order.datetime}</td>
                        <td className="px-6 py-4">{order.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {t("no_nutrition_orders_found")}
                </div>
              )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* ----------------------------- */}
    </div>
  );
};

// The wrapper with the QueryClientProvider is still correct and necessary.
const NutritionOrdersTab: React.FC<PluginEncounterTabProps> = (props) => {
  return (
    <QueryClientProvider client={nutritionTabQueryClient}>
      <NutritionOrdersTabInner {...props} />
    </QueryClientProvider>
  );
};

export default NutritionOrdersTab;