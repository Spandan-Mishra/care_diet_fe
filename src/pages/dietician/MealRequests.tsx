import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, LayoutGrid, List } from "lucide-react";
import { useState, useMemo } from "react";
import MealTable from "@/components/dietician/MealTable";
import type { MealRequest } from "@/components/dietician/MealTable";
import MealCardView from "@/components/dietician/MealCardView";

const dummyMealRequests: MealRequest[] = [
  { name: "John Doe", roomNo: "101", clinicalNotes: "Diabetic, needs low sugar" },
  { name: "Jane Smith", roomNo: "102", clinicalNotes: "High protein required" },
  { name: "Alice Brown", roomNo: "103", clinicalNotes: "Vegetarian" },
  { name: "Bob Lee", roomNo: "104", clinicalNotes: "Gluten free" },
  { name: "Priya Kumar", roomNo: "105", clinicalNotes: "Low sodium" },
  { name: "Carlos Mendez", roomNo: "106", clinicalNotes: "Vegan, high calorie" },
  { name: "Fatima Noor", roomNo: "107", clinicalNotes: "Halal, low fat" },
  { name: "Emily Zhang", roomNo: "108", clinicalNotes: "Lactose intolerant" },
  { name: "Mohammed Ali", roomNo: "109", clinicalNotes: "Kosher, high protein" },
  { name: "Sara O'Connor", roomNo: "110", clinicalNotes: "Soft food only" },
];

export default function MealRequests() {
  const [view, setView] = useState<"card" | "list">("card");
  const [search, setSearch] = useState("");

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return dummyMealRequests;
    return dummyMealRequests.filter(
      (req) =>
        req.name.toLowerCase().includes(q) ||
        req.roomNo.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="text-left w-full max-w-5xl mx-auto mt-10 px-2 md:px-6">
      <h1 className="text-2xl font-bold mb-4">Meal Requests</h1>
      <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 mb-8">
        <section className="flex items-center gap-2 md:gap-4 mb-2 md:mb-0">
          <Input
            placeholder="Search patients..."
            className="max-w-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </section>
        <section>
          <div className="flex gap-2">
            <Button
              variant={view === "card" ? "default" : "outline"}
              className={view === "card" ? "bg-green-50 border-green-600 text-green-600" : ""}
              onClick={() => setView("card")}
              aria-label="Card view"
            >
              Card
              <LayoutGrid className="w-5 h-5" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              className={view === "list" ? "bg-green-50 border-green-600 text-green-600" : ""}
              onClick={() => setView("list")}
              aria-label="List view"
            >
              List
              <List className="w-5 h-5" />
            </Button>
          </div>
        </section>
      </div>
      <div className="overflow-x-auto">
        {view === "list" ? (
          <MealTable mealRequests={filteredRequests} />
        ) : (
          <MealCardView mealRequests={filteredRequests} />
        )}
      </div>
    </div>
  );
}
