import React from "react";
import type { Encounter } from "../../types/encounter";
import type { PatientRead } from "../../types/patient";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../ui/card";
import { dietApi } from "../../api/dietApi";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { I18NNAMESPACE } from "../../types/namespace";
import { Button } from "../ui/button";
import { navigate } from "raviger";
import { PlusIcon } from "lucide-react";

const nutritionTabQueryClient = new QueryClient();

interface PluginEncounterTabProps {
  encounter: Encounter;
  patient: PatientRead;
}

const EncounterNutritionOrdersTabInner: React.FC<PluginEncounterTabProps> = ({ encounter, patient }) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const facilityId = "2c50ae47-bea8-48e1-be5d-27daf87a1a89";

  const { data, isLoading } = useQuery({
    queryKey: ["nutrition_orders", encounter.id],
    queryFn: () =>
      dietApi.listEncounterNutritionOrders({
        encounter: encounter.id!,
      }),
    enabled: !!encounter.id,
  });

  const orders = data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-end">

        <Button 
          className="text-white" 
          onClick={() => 
            navigate(`/facility/${facilityId}/patient/${patient.id}/encounter/${encounter.id}/questionnaire/nutrition_order`
            )
          }
          >
            <PlusIcon className="size-5 mr-1" />
            Add Nutrition Order
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Card className="overflow-hidden">
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
  );
};

const EncounterNutritionOrdersTab: React.FC<PluginEncounterTabProps> = (props) => {
  return (
    <QueryClientProvider client={nutritionTabQueryClient}>
      <EncounterNutritionOrdersTabInner {...props}/>
    </QueryClientProvider>
  );
};

export default EncounterNutritionOrdersTab;