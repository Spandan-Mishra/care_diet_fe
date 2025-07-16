import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";

export type MealRequest = {
  name: string;
  roomNo: string;
  clinicalNotes: string;
};

interface MealTableProps {
  mealRequests: MealRequest[];
}

export default function MealTable({ mealRequests }: MealTableProps) {
  return (
    <div className="overflow-x-auto w-4xl rounded-lg border border-gray-200">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left font-semibold">Name</th>
            <th className="px-4 py-2 text-left font-semibold">Room no.</th>
            <th className="px-4 py-2 text-left font-semibold">Clinical Notes</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {mealRequests.map((req, idx) => (
            <tr key={idx} className="border-b last:border-0">
              <td className="px-4 py-2 whitespace-nowrap">{req.name}</td>
              <td className="px-4 py-2 whitespace-nowrap">{req.roomNo}</td>
              <td className="px-4 py-2">
                <Button variant="outline" className="text-green-700 border-green-600 hover:bg-green-50">
                  Clinical Note
                </Button>
              </td>
              <td className="px-4 py-2">
                <Button variant="outline" className="bg-gray-900 text-white border-gray-900 hover:bg-white hover:text-black">
                  <SquareArrowOutUpRight />
                  Build Plan
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
