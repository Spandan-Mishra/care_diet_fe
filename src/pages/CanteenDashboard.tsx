import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dietApi } from "../api/dietApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CanteenDashboardProps {
  facilityId: string;
}

interface OrderForCanteen {
  id: string;
  patient: { name: string };
  products: { name: string }[];
  status: string;
}

const CanteenDashboard: React.FC<CanteenDashboardProps> = ({ facilityId }) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["canteen_orders", facilityId],
    queryFn: async () => {
      const params = new URLSearchParams({ facility: facilityId });
      const res = await fetch(`${dietApi.listCanteenOrders.path}?${params}`);
      if (!res.ok) throw new Error("Failed to fetch canteen orders");
      return res.json() as Promise<{ results: OrderForCanteen[] }>;
    },
    enabled: !!facilityId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      fetch(dietApi.updateCanteenOrder.path(orderId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ status }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canteen_orders", facilityId] });
    },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Canteen: Active Meal Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Patient</th>
                <th className="p-2 text-left">Products</th>
                <th className="p-2 text-left">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.results?.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="p-2">{order.patient.name}</td>
                  <td className="p-2">{order.products.map(p => p.name).join(", ")}</td>
                  <td className="p-2">
                    <select
                      defaultValue={order.status}
                      onChange={(e) => updateStatusMutation.mutate({ orderId: order.id, status: e.target.value })}
                      className="p-2 border rounded"
                    >
                      <option value="active">Active</option>
                      <option value="in-preparation">In Preparation</option>
                      <option value="served">Served</option>
                      <option value="on-hold">On Hold</option>
                    </select>
                  </td>
                </tr>
              ))}
               {data?.results?.length === 0 && (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500">No active orders.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CanteenDashboard;