import MealCard from "./MealCard";
import type { MealRequest } from "./MealTable";

interface MealCardViewProps {
  mealRequests: MealRequest[];
}

export default function MealCardView({ mealRequests }: MealCardViewProps) {
  return (
    <div className="flex flex-wrap gap-6 justify-start">
      {mealRequests.map((req, idx) => (
        <div key={idx} className="min-w-[260px] max-w-xs flex-1">
          <MealCard name={req.name} roomNo={req.roomNo} clinicalNotes={req.clinicalNotes} />
        </div>
      ))}
    </div>
  );
}
