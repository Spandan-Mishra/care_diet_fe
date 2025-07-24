import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { dietApi } from "@/api/dietApi";
import { Card, CardContent } from "@/components/ui/card";
import { I18NNAMESPACE } from "@/types/namespace"; 

const CanteenDashboard: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const { t } = useTranslation(I18NNAMESPACE);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["canteen_orders", facilityId],
    queryFn: async () => {
      const params = new URLSearchParams({ facility: facilityId! });
      const res = await fetch(`${dietApi.listCanteenOrders.path}?${params}`);
      return res.json();
    },
    enabled: !!facilityId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => {
      return fetch(dietApi.updateCanteenOrder.path(orderId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canteen_orders", facilityId] });
    },
  });

  if (isLoading) return <div>{t("loading")}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Canteen: Active Meal Orders</h1>
      <Card>
        <CardContent>
          <table className="min-w-full">
            <thead><tr><th>Patient</th><th>Products</th><th>Status</th></tr></thead>
            <tbody>
              {data?.results?.map((order: any) => (
                <tr key={order.id}>
                  <td>{order.patient?.name || "N/A"}</td>
                  <td>{order.products.map((p: any) => p.name || 'Product').join(", ")}</td>
                  <td>
                    <select
                      defaultValue={order.status}
                      onChange={(e) => updateStatusMutation.mutate({ orderId: order.id, status: e.target.value })}
                      className="p-2 border rounded"
                      disabled={updateStatusMutation.isPending}
                    >
                      <option value="active">Active</option>
                      <option value="in-preparation">In Preparation</option>
                      <option value="served">Served</option>
                      <option value="on-hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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

export default CanteenDashboard;