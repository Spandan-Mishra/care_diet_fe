import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";

interface MealCardProps {
  name: string;
  roomNo: string;
  clinicalNotes: string;
}

export default function MealCard({ name, roomNo, clinicalNotes }: MealCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col overflow-hidden min-w-[220px] max-w-xs w-full">
      <div className="bg-green-600 h-4 w-full" />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-lg font-semibold mb-1">{name}</div>
          <div className="text-gray-500 text-sm mb-2">Room No.: {roomNo}</div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" className="text-green-700 border-green-600 hover:bg-green-50">
            Clinical Note
          </Button>
          <Button variant="outline" className="bg-gray-900 text-white border-gray-900 hover:bg-white hover:text-black">
            <SquareArrowOutUpRight />
            Build Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
