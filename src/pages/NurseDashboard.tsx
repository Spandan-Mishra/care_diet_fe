import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { dietApi, type NutritionIntakeCreate } from "@/api/dietApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { I18NNAMESPACE } from "@/types/namespace";

const NurseDashboard: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const { t } = useTranslation(I18NNAMESPACE);

  const { data, isLoading } = useQuery({
    queryKey: ["nurse_orders_view", facilityId],
    queryFn: async () => {
      const params = new URLSearchParams({ facility: facilityId! });
      const res = await fetch(`${dietApi.listCanteenOrders.path}?${params}`);
      return res.json();
    },
    enabled: !!facilityId,
  });

  const logIntakeMutation = useMutation({
    mutationFn: async (newIntake: NutritionIntakeCreate) => {
      const res = await fetch(dietApi.createIntakeLog.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIntake),
      });
      if (!res.ok) {
        throw new Error("Failed to log intake");
      }
      return res.json();
    },
    onSuccess: () => {
      alert("Intake logged successfully!");
    },
  });

  const handleLogIntake = (order: any) => {
    logIntakeMutation.mutate({
      patient: order.patient.id,
      encounter: order.encounter.id,
      facility: order.facility.id,
      location: order.location.id,
      status: "completed",
      intake_items: order.products,
      occurrence_datetime: new Date().toISOString(),
      note: `Intake logged for order ${order.id}`,
      service_type: "food",
      status_reason: null,
    });
  };

  if (isLoading) return <div>{t("loading")}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Nurse: Log Patient Intake</h1>
      <Card>
        <CardContent>
          <table className="min-w-full">
            <thead><tr><th>Patient</th><th>Order</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {data?.results?.map((order: any) => (
                <tr key={order.id}>
                  <td>{order.patient?.name || "N/A"}</td>
                  <td>{order.products.map((p: any) => p.name || 'Product').join(", ")}</td>
                  <td>{order.status}</td>
                  <td>
                    <Button onClick={() => handleLogIntake(order)} disabled={logIntakeMutation.isPending}>
                      Log Intake
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default NurseDashboard;