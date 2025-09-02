import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import IntakeLoggingModal from "./IntakeLoggingModal";

const STATUS_CONFIG = {
  "draft": { color: "bg-gray-500", label: "Draft" },
  "active": { color: "bg-blue-500", label: "Active" },
  "on-hold": { color: "bg-yellow-500", label: "On Hold" },
  "revoked": { color: "bg-red-500", label: "Revoked" },
  "completed": { color: "bg-green-500", label: "Completed" },
  "entered-in-error": { color: "bg-red-500", label: "Error" },
  "unknown": { color: "bg-gray-500", label: "Unknown" },
};

interface NutritionOrderCardProps {
  order: any;
  facilityId: string;
  patientId: string;
  encounterId: string;
  encounterIntakeLogs: any[];
}

const NutritionOrderCard: React.FC<NutritionOrderCardProps> = ({ 
  order, 
  facilityId, 
  encounterIntakeLogs 
}) => {
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG["unknown"];

  // Filter intake logs for this specific order
  const orderIntakeLogs = encounterIntakeLogs.filter(
    log => log.nutrition_order === order.id
  );

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get product names for summary
  const productNames = order.products?.map((p: any) => p.name).join(", ") || "No products";

  return (
    <>
      <Card className="w-full shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            {/* Row-wise compact display */}
            <div className="flex items-center justify-between space-x-4">
              {/* Products Summary */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {productNames}
                </div>
                <div className="text-xs text-gray-500">
                  {order.products?.length || 0} product{(order.products?.length || 0) !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                <Badge className={`${statusConfig.color} text-white text-xs`}>
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Expand/Collapse Button */}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            {/* Expanded Details */}
            <CollapsibleContent className="space-y-4 mt-4">
              {/* Patient Allergies Warning */}
              {order.patient_allergies && order.patient_allergies.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-amber-800 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Patient Allergies (captured at order time)</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {order.patient_allergies.map((allergy: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                        {allergy.code?.display || "Unknown allergy"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
                <div className="space-y-3">
                  {order.products?.map((product: any, index: number) => (
                    <div key={product.id || index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{product.name}</h5>
                          <div className="text-sm text-gray-600 mt-1">
                            <span>Quantity: {product.quantity}</span>
                            <span className="ml-4">Calories: {product.calories} kcal</span>
                          </div>
                          {product.allergens && product.allergens.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className="text-xs text-gray-500">Allergens:</span>
                              {product.allergens.map((allergen: any, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {allergen.display || allergen}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Show Intake Logs only for completed orders */}
              {order.status === 'completed' && orderIntakeLogs.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Intake Logs</h4>
                    <div className="space-y-2">
                      {orderIntakeLogs.map((log: any) => (
                        <div key={log.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-green-800">
                                {log.product?.name || "Unknown Product"}
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                Consumed: {log.consumed_quantity} | Logged: {formatDateTime(log.created_date)}
                              </div>
                            </div>
                            {log.charge_item && (
                              <Badge variant="outline" className="text-xs">
                                Billed
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={() => setShowIntakeModal(true)}
                  className="text-white"
                  disabled={order.status !== 'completed' || order.status === 'revoked'}
                >
                  Log Intake
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <IntakeLoggingModal
        open={showIntakeModal}
        onOpenChange={setShowIntakeModal}
        nutritionOrder={order}
        facilityId={facilityId}
      />
    </>
  );
};

export default NutritionOrderCard;