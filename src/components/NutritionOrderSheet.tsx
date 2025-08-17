import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import NutritionOrderInfo from "../components/NutritionOrderInfo";

interface NutritionOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

const NutritionOrderSheet: React.FC<NutritionOrderSheetProps> = ({ open, onOpenChange, order }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full bg-white sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Meal Details</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <NutritionOrderInfo order={order} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NutritionOrderSheet;
