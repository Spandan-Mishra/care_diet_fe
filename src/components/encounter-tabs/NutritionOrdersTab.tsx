import React from "react";
import type { Encounter } from "../../types/encounter";
import type { PatientRead } from "../../types/patient";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../ui/card";
import { dietApi } from "../../api/dietApi";
import type { NutritionOrder } from "../../types/nutrition_order";
import { useQuery } from "@tanstack/react-query";
import { I18NNAMESPACE } from "../../types/namespace";

interface PluginEncounterTabProps {
  encounter: Encounter;
  patient: PatientRead;
}

const NutritionOrdersTab: React.FC<PluginEncounterTabProps> = ({ encounter, patient }) => {
  const { t } = useTranslation(I18NNAMESPACE);

  const { data, isLoading } = useQuery({
    queryKey: ["nutrition_orders", encounter.id],
    queryFn: async () => {
      const params = new URLSearchParams({ encounter: encounter.id });
      const res = await fetch(
        `${dietApi.listEncounterNutritionOrders.path}?${params.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch nutrition orders");
      return res.json() as Promise<{ results: NutritionOrder[] }>;
    },
    enabled: !!encounter.id,
  });

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }

  if (!data?.results?.length) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 text-center text-gray-500">
              {t("no_nutrition_orders_found")}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("schedule")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("datetime")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("note")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.results.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.products.map((p) => p.name).join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.schedule?.frequency || t("no_data_placeholder")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.datetime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.note || t("no_data_placeholder")}
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

export default NutritionOrdersTab;