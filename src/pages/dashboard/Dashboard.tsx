import { Button } from "@/components/ui/button";
import { Calendar, Stethoscope, Utensils } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="text-left max-w-xl mt-10 pr-6">
      <h1 className="text-3xl font-bold mb-6">Hey, Mr. Dietician</h1>
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="flex flex-row gap-4">
        <Button variant="outline" className="bg-white flex items-center gap-2 shadow">
          <Calendar className="text-green-600" />
          My Schedules
        </Button>
        <Button variant="outline" className="bg-white flex items-center gap-2 shadow">
          <Stethoscope className="text-green-600" />
          Encounters
        </Button>
        <Button variant="outline" className="bg-white flex items-center gap-2 shadow">
          <Utensils className="text-green-600" />
          Meal Requests
        </Button>
      </div>
    </div>
  );
}
