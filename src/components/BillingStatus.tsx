import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ExternalLinkIcon } from "lucide-react";
import { dietApi } from "../api/dietApi";

interface BillingStatusProps {
  intakeId: string;
  facilityId: string;
  chargeItemId?: string;
}

const BillingStatus: React.FC<BillingStatusProps> = ({ 
  intakeId, 
  facilityId, 
  chargeItemId 
}) => {
  const { data: chargeItems } = useQuery({
    queryKey: ["charge_items", intakeId],
    queryFn: () => dietApi.listChargeItems({ 
      facility: facilityId,
      service_resource: "nutrition_intake",
      service_resource_id: intakeId
    }),
    enabled: !!intakeId && !!facilityId,
  });

  const chargeItem = chargeItems?.results?.[0];

  if (!chargeItem && !chargeItemId) {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
        No Billing
      </Badge>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "billable": return "bg-blue-100 text-blue-800";
      case "billed": return "bg-green-100 text-green-800"; 
      case "paid": return "bg-emerald-100 text-emerald-800";
      case "entered_in_error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={getStatusColor(chargeItem?.status || "billable")}>
        {chargeItem?.status === "billable" && "💰 Billable"}
        {chargeItem?.status === "billed" && "📄 Billed"}
        {chargeItem?.status === "paid" && "✅ Paid"}
        {chargeItem?.status === "entered_in_error" && "❌ Error"}
        {!chargeItem && "💰 Billable"}
      </Badge>
      {chargeItem && (
        <a 
          href={`/facility/${facilityId}/billing/account?charge_item=${chargeItem.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <ExternalLinkIcon size={14} />
        </a>
      )}
    </div>
  );
};

export default BillingStatus;
