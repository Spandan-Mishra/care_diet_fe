import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, MapPin, AlertTriangle, Receipt, DollarSign } from "lucide-react";
import { dietApi } from "../api/dietApi";
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

const CHARGE_ITEM_STATUS_CONFIG = {
  "planned": { color: "bg-blue-500", label: "Planned" },
  "billable": { color: "bg-indigo-500", label: "Billable" },
  "not_billable": { color: "bg-yellow-500", label: "Not Billable" },
  "billed": { color: "bg-green-500", label: "Billed" },
  "paid": { color: "bg-primary", label: "Paid" },
  "entered_in_error": { color: "bg-red-500", label: "Error" },
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

  // Fetch charge items for this nutrition order
  const { data: chargeItems } = useQuery({
    queryKey: ["charge_items", order.id],
    queryFn: () => dietApi.listChargeItems({
      facility: facilityId,
      service_resource: "nutrition_order",
      service_resource_id: order.id,
    }),
    enabled: !!order.id,
  });

  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG["unknown"];
  const hasChargeItems = chargeItems?.results && chargeItems.results.length > 0;
  const totalBillingAmount = hasChargeItems ? 
    chargeItems.results.reduce((sum, item) => sum + (item.total_price || 0), 0) : 0;

  // Filter intake logs for this specific order
  const orderIntakeLogs = encounterIntakeLogs.filter(
    log => log.nutrition_order === order.id
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card className="w-full shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Nutrition Order #{order.id}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${statusConfig.color} text-white`}>
                {statusConfig.label}
              </Badge>
              {hasChargeItems && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Receipt className="h-3 w-3" />
                  Billable
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Patient Information */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Patient:</span>
            <span>{order.patient?.name || order.patient}</span>
          </div>

          {/* Location Information */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Location:</span>
            <span>{order.encounter?.current_bed || "N/A"}</span>
          </div>

          {/* Order Date */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Ordered:</span>
            <span>{formatDateTime(order.created_date)}</span>
          </div>

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

          <div className="border-t border-gray-200 my-4"></div>

          {/* Products */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Ordered Products</h4>
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
                    {product.charge_item_definition && (
                      <Badge variant="outline" className="ml-2">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Billable
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intake Logs */}
          {orderIntakeLogs.length > 0 && (
            <>
              <div className="border-t border-gray-200 my-4"></div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Intake History</h4>
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

          {/* Billing Information */}
          {hasChargeItems && (
            <>
              <div className="border-t border-gray-200 my-4"></div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900 flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Billing Information
                  </h4>
                  <div className="text-lg font-semibold text-blue-900">
                    {formatCurrency(totalBillingAmount)}
                  </div>
                </div>
                <div className="space-y-2">
                  {chargeItems.results.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-blue-800">{item.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${CHARGE_ITEM_STATUS_CONFIG[item.status as keyof typeof CHARGE_ITEM_STATUS_CONFIG]?.color || 'bg-gray-500'} text-white text-xs`}
                        >
                          {CHARGE_ITEM_STATUS_CONFIG[item.status as keyof typeof CHARGE_ITEM_STATUS_CONFIG]?.label || item.status}
                        </Badge>
                        <span className="font-medium text-blue-900">
                          {formatCurrency(item.total_price || 0)}
                        </span>
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
              disabled={order.status === 'completed' || order.status === 'revoked'}
            >
              Log Intake
            </Button>
          </div>
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