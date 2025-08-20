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
import NutritionOrderCard from "../NutritionOrderCard";

const nutritionTabQueryClient = new QueryClient();

interface PluginEncounterTabProps {
  encounter: Encounter;
  patient: PatientRead;
}

const NutritionOrdersTabInner: React.FC<PluginEncounterTabProps> = ({ encounter, patient }) => {
  const { t } = useTranslation(I18NNAMESPACE);
  const facilityId = encounter.facility.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["nutrition_orders", encounter.id],
    queryFn: () => dietApi.listEncounterNutritionOrders({ encounter: encounter.id }),
  });

  if (isLoading) return <div className="p-4">Loading Nutrition Orders...</div>;
  if (isError) return <div className="p-4 text-red-600">Error: {error.message}</div>;

  const orders = data?.results || [];

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
            <NutritionOrderCard
              key={order.id}
              order={order}
              facilityId={facilityId}
              patientId={patient.id}
              encounterId={encounter.id}
            />
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