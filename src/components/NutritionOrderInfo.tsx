import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NutritionOrderInfoProps {
  order: any;
}

const NutritionOrderInfo: React.FC<NutritionOrderInfoProps> = ({ order }) => {
  if (!order) return <div className="text-gray-500">No order selected</div>;
  
  const formatPatientName = (patient: any) => {
    if (typeof patient === 'object' && patient?.name) return patient.name;
    if (typeof patient === 'string') return patient;
    return "Unknown Patient";
  };

  const formatPatientId = (patient: any) => {
    if (typeof patient === 'object' && patient?.id) return patient.id;
    if (typeof patient === 'string') return patient;
    return "Unknown ID";
  };

  const formatRoomBed = (encounter: any) => {
    if (typeof encounter === 'object' && encounter?.current_bed) return encounter.current_bed;
    return "No bed assigned";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800";
      case "in-preparation": return "bg-yellow-100 text-yellow-800";
      case "served": return "bg-green-100 text-green-800";
      case "on-hold": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-semibold text-gray-700">Patient:</span>
            <div className="text-gray-900">{formatPatientName(order.patient)}</div>
            <div className="text-sm text-gray-500">ID: {formatPatientId(order.patient)}</div>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Room/Bed:</span>
            <div className="text-gray-900">{formatRoomBed(order.encounter)}</div>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Scheduled Time:</span>
            <div className="text-gray-900">{order.datetime ? new Date(order.datetime).toLocaleString() : "-"}</div>
            {order.schedule && (
              <div className="text-sm text-gray-600 mt-1">
                Schedule: {order.schedule.time} ({order.schedule.frequency})
              </div>
            )}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Status:</span>
            <div className="mt-1">
              <Badge className={getStatusColor(order.status)}>
                {order.status?.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Meal Products</CardTitle>
        </CardHeader>
        <CardContent>
          {order.products?.length > 0 ? (
            <div className="space-y-3">
              {order.products.map((product: any, index: number) => (
                <div key={product.id || index} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="font-medium text-gray-900">{product.name || "Unknown Product"}</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {product.quantity && <div>Quantity: {product.quantity}</div>}
                    {product.calories && <div>Calories: {product.calories}</div>}
                    {product.code && <div>Code: {product.code}</div>}
                    {product.allergens?.length > 0 && (
                      <div className="text-red-600">
                        <span className="font-medium">Allergens:</span> {product.allergens.join(", ")}
                      </div>
                    )}
                    {product.note && (
                      <div className="text-gray-500 text-xs">
                        <span className="font-medium">Note:</span> {product.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No products found</div>
          )}
        </CardContent>
      </Card>

      {order.note && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{order.note}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NutritionOrderInfo;
