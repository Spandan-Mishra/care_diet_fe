import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import IntakeLoggingModal from "./IntakeLoggingModal";

const STATUS_COLORS = {
  completed: "bg-green-100 text-green-800",
  "in-progress": "bg-yellow-100 text-yellow-800", 
  "not-done": "bg-red-100 text-red-800",
  stopped: "bg-red-100 text-red-800",
  "entered-in-error": "bg-gray-100 text-gray-800",
} as const;

interface NutritionOrderCardProps {
  order: any;
  facilityId: string;
  patientId: string;
  encounterId: string;
  encounterIntakeLogs?: any[]; // Pass intake logs from parent
}

const NutritionOrderCard: React.FC<NutritionOrderCardProps> = ({ 
  order, 
  facilityId,
  encounterIntakeLogs = [] 
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  // Filter intake logs that are related to this nutrition order
  // We can filter by time proximity, products, or just show all encounter logs
  const relevantIntakeLogs = React.useMemo(() => {
    if (!encounterIntakeLogs || encounterIntakeLogs.length === 0) return [];
    
    // For now, show all intake logs for the encounter
    // You can enhance this later to filter by:
    // - Time proximity to the order
    // - Product matching
    // - Or other business logic
    return encounterIntakeLogs.filter(log => {
      // Only show logs that occurred after this order was created
      if (order.datetime && log.occurrence_datetime) {
        const orderTime = new Date(order.datetime).getTime();
        const logTime = new Date(log.occurrence_datetime).getTime();
        return logTime >= orderTime;
      }
      return true;
    }).slice(0, 5); // Show max 5 recent logs to avoid clutter
  }, [encounterIntakeLogs, order]);

  console.log("Relevant intake logs for order:", order.id, relevantIntakeLogs);

  const formatStatus = (status: string) => {
    return status.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800";
      case "in-preparation": return "bg-yellow-100 text-yellow-800";
      case "served": return "bg-green-100 text-green-800";
      case "completed": return "bg-green-100 text-green-800";
      case "on-hold": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {order.products?.map((p: any) => p.name).join(", ") || "No products"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getOrderStatusColor(order.status)}>
                {formatStatus(order.status)}
              </Badge>
              <span className="text-sm text-gray-500">
                {order.datetime ? new Date(order.datetime).toLocaleString() : "No date"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {order.status === "completed" && (
              <Button
                size="sm"
                onClick={() => setIsIntakeModalOpen(true)}
                className="gap-2 text-white"
              >
                <FileText className="h-4 w-4" />
                Log Intake
              </Button>
            )}
            <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Details
                  {isDetailsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Order Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Prescribed by:</span> {order.prescribed_by || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Service Type:</span> {order.service_type || "N/A"}
                  </div>
                  {order.schedule && (
                    <div>
                      <span className="font-medium">Schedule:</span> {order.schedule.time} ({order.schedule.frequency})
                    </div>
                  )}
                  {order.note && (
                    <div className="col-span-2">
                      <span className="font-medium">Note:</span> {order.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Products Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Products</h4>
                <div className="space-y-2">
                  {order.products?.map((product: any, index: number) => (
                    <div key={product.id || index} className="border-l-4 border-blue-200 pl-3 py-1">
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {product.quantity && <div>Quantity: {product.quantity}</div>}
                        {product.calories && <div>Calories: {product.calories}</div>}
                        {product.allergens?.length > 0 && (
                          <div className="text-red-600">
                            Allergens: {product.allergens.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intake Logs */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recent Intake Logs</h4>
                {relevantIntakeLogs.length > 0 ? (
                  <div className="space-y-2">
                    {relevantIntakeLogs.map((log: any, index: number) => (
                      <div key={log.id || index} className="border rounded p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className={STATUS_COLORS[log.status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-800"}>
                            {formatStatus(log.status)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {log.occurrence_datetime ? new Date(log.occurrence_datetime).toLocaleString() : "No date"}
                          </span>
                        </div>
                        {log.status_reason && (
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Reason:</span> {log.status_reason}
                          </div>
                        )}
                        {log.intake_items?.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">Items consumed:</span>
                            <ul className="list-disc list-inside ml-2">
                              {log.intake_items.map((item: any, i: number) => (
                                <li key={i}>{item.name || `Product ${item.product_id}`}: {item.quantity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {log.note && (
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Note:</span> {log.note}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Logged by: {log.logged_by || "Unknown"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No recent intake logs found</div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <IntakeLoggingModal
        open={isIntakeModalOpen}
        onOpenChange={setIsIntakeModalOpen}
        nutritionOrder={order}
        facilityId={facilityId}
      />
    </Card>
  );
};

export default NutritionOrderCard;
