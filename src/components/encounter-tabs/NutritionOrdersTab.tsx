import React from "react";
import type { Encounter } from "../../types/encounter";
import type { PatientRead } from "../../types/patient";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../ui/card";

export const I18NNAMESPACE = "care_diet_fe";

interface PluginEncounterTabProps {
  encounter: Encounter;
  patient: PatientRead;
}

const NutritionOrdersTab: React.FC<PluginEncounterTabProps> = ({ encounter: _encounter, patient: _patient }) => {
  const { t } = useTranslation(I18NNAMESPACE);

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
  )
};

export default NutritionOrdersTab; 