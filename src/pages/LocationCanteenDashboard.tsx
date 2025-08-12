import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dietApi } from "../api/dietApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LocationCanteenDashboardProps {
  facilityId: string;
  locationId: string;
}

const LocationCanteenDashboard: React.FC<LocationCanteenDashboardProps> = ({ 
  facilityId, 
  locationId 
}) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["location_canteen_orders", facilityId, locationId],
    queryFn: () => dietApi.listCanteenOrders({ facility: facilityId, location: locationId }),
    enabled: !!facilityId && !!locationId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (variables: { orderId: string; status: string }) =>
      dietApi.updateCanteenOrder(variables.orderId, { status: variables.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["location_canteen_orders", facilityId, locationId] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800";
      case "in-preparation": return "bg-yellow-100 text-yellow-800";
      case "served": return "bg-green-100 text-green-800";
      case "on-hold": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!facilityId || !locationId) {
    return <div className="diet-container p-4">Invalid facility or location ID</div>;
  }

  if (isLoading) return <div className="diet-container p-4">Loading...</div>;

  return (
    <div className="diet-container p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Canteen Orders</h1>
          <p className="text-gray-600">Location ID: {locationId}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Meal Orders for This Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left">Patient</th>
                  <th className="p-3 text-left">Room/Bed</th>
                  <th className="p-3 text-left">Products</th>
                  <th className="p-3 text-left">Order Time</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.results?.map((order: any) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{order.patient.name}</div>
                      <div className="text-sm text-gray-500">ID: {order.patient.id}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{order.encounter.current_bed || "No bed assigned"}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {order.products.map((p: any) => p.name).join(", ")}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {new Date(order.datetime).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatusMutation.mutate({ 
                          orderId: order.id, 
                          status: e.target.value 
                        })}
                        className="text-sm p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={updateStatusMutation.isPending}
                      >
                        <option value="active">Active</option>
                        <option value="in-preparation">In Preparation</option>
                        <option value="served">Served</option>
                        <option value="on-hold">On Hold</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {data?.results?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">
                      No active orders for this location.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationCanteenDashboard;
