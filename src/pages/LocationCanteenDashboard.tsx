import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dietApi } from "../api/dietApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import NutritionOrderSheet from "../components/NutritionOrderSheet";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationCanteenDashboardProps {
  facilityId: string;
  locationId: string;
}

const LocationCanteenDashboard: React.FC<LocationCanteenDashboardProps> = ({ facilityId, locationId }) => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const handleViewMeal = (order: any) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  };

  if (!facilityId || !locationId) {
    return <div className="diet-container p-4">Invalid facility or location ID</div>;
  }

  if (isLoading) return <div className="diet-container p-4">Loading...</div>;

  return (
    <div className="diet-container p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-left">Canteen Orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            Canteen Dashboard for viewing and updating nutrition orders
          </p>
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
                  <th className="p-3 text-center">Patient</th>
                  <th className="p-3 text-center">Room/Bed</th>
                  <th className="p-3 text-center">Products</th>
                  <th className="p-3 text-center">Scheduled Time</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.results?.map((order: any) => {
                  // Handle both old and new data structures
                  const patientName = (typeof order.patient === 'object' && order.patient?.name) 
                    ? order.patient.name 
                    : (typeof order.patient === 'string' ? order.patient : "Unknown Patient");
                    
                  const patientId = (typeof order.patient === 'object' && order.patient?.id) 
                    ? order.patient.id 
                    : (typeof order.patient === 'string' ? order.patient : "Unknown ID");
                    
                  const roomBed = (typeof order.encounter === 'object' && order.encounter?.current_bed) 
                    ? order.encounter.current_bed 
                    : "No bed assigned";
                    
                  const products = Array.isArray(order.products) && order.products.length > 0
                    ? order.products.map((p: any) => typeof p === 'object' ? p.name : p).join(", ")
                    : "No products";
                  
                  return (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{patientName}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">{roomBed}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm max-w-xs truncate" title={products}>
                          {products}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {order.datetime ? new Date(order.datetime).toLocaleString() : "-"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatusMutation.mutate({ 
                              orderId: order.id, 
                              status: e.target.value 
                            })}
                            className="text-sm p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            disabled={updateStatusMutation.isPending}
                          >
                            <option value="active">Active</option>
                            <option value="in-preparation">In Preparation</option>
                            <option value="served">Served</option>
                            <option value="on-hold">On Hold</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-3">
                        <Button
                          variant="outline"
                          className="font-medium hover:text-blue-800"
                          onClick={() => handleViewMeal(order)}
                        >
                          View Meal
                          <ArrowUpRight />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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

      <NutritionOrderSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        order={selectedOrder}
      />
    </div>
  );
};

export default LocationCanteenDashboard;
