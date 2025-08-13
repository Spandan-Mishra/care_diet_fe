import React from "react";
import type { Encounter } from "../../types/encounter";
import type { PatientRead } from "../../types/patient";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../ui/card";
import { dietApi } from "../../api/dietApi";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { I18NNAMESPACE } from "../../types/namespace";
import { Button } from "@/components/ui/button";
import { navigate } from "raviger";
import { PlusIcon } from "lucide-react";

const nutritionTabQueryClient = new QueryClient();

interface PluginEncounterTabProps {
  encounter: Encounter;
  patient: PatientRead;
}

const NutritionOrdersTabInner: React.FC<PluginEncounterTabProps> = ({ encounter, patient }) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const facilityId = encounter.facility.id;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["nutrition_orders", encounter.id],
    queryFn: () => dietApi.listEncounterNutritionOrders({ encounter: encounter.id }),
  });

  if (isLoading) return <div className="p-4">Loading Nutrition Orders...</div>;
  if (isError) return <div className="p-4 text-red-600">Error: {error.message}</div>;

  const orders = data?.results || [];
  console.log(orders);

  return (
    <div className="diet-container p-4">
      <div className="flex justify-end mb-4 text-white">
        <Button 
          onClick={() => navigate(`/facility/${facilityId}/patient/${patient.id}/encounter/${encounter.id}/questionnaire/nutrition_order`)}
        >
          <PlusIcon />
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
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Products</p>
                  <p className="text-sm">{order.products.map((p) => p.name).join(", ") || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Status</p>
                  <p className="text-sm capitalize">{order.status}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Prescribed On</p>
                  <p className="text-sm">{order.datetime}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Prescribed By</p>
                  <p className="text-sm">{order.prescribed_by || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const NutritionOrdersTab: React.FC<PluginEncounterTabProps> = (props) => {
  return (
    <QueryClientProvider client={nutritionTabQueryClient}>
      <NutritionOrdersTabInner {...props} />
    </QueryClientProvider>
  );
};

export default NutritionOrdersTab;