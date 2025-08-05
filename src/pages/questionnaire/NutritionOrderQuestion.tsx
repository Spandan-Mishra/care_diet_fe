import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { dietApi, type NutritionOrderCreate } from "../../api/dietApi";
import { type NutritionProduct } from "../../types/nutrition_product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// This is a simple form component, so it only needs these props.
interface NutritionOrderQuestionProps {
  facilityId: string;
  patientId: string;
  encounterId: string;
  onSuccess: () => void; // The callback to close the form
}

// Zod schema for validating the order details form.
const formSchema = z.object({
  status: z.enum(["active", "on-hold"]),
  datetime: z.string().min(1, "Date and time are required"),
  schedule_time: z.string().min(1, "Schedule time is required"),
  schedule_frequency: z.string().min(1, "Schedule frequency is required"),
  note: z.string().optional(),
});

type OrderFormData = z.infer<typeof formSchema>;

const NutritionOrderQuestion: React.FC<NutritionOrderQuestionProps> = ({
  facilityId,
  patientId,
  encounterId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<NutritionProduct | null>(null);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["nutrition_products_search", facilityId, productSearch],
    queryFn: () =>
      dietApi.listNutritionProducts({ facility: facilityId, search: productSearch }),
    select: (data) => data.results,
  });

  const form = useForm<OrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: "active", schedule_frequency: "daily" },
  });

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: dietApi.createMealOrder,
    onSuccess: () => {
      alert("Nutrition Order created successfully!");
      queryClient.invalidateQueries({ queryKey: ["nutrition_orders", encounterId] });
      setSelectedProduct(null); // Reset the form selection
      onSuccess(); // Call the callback to close the form in the parent tab
    },
    onError: (error: Error) => alert(error.message),
  });

  const onSubmit = (data: OrderFormData) => {
    if (!selectedProduct) {
      alert("Please select a nutrition product.");
      return;
    }

    const payload: NutritionOrderCreate = {
      patient: patientId,
      encounter: encounterId,
      facility: facilityId,
      location: selectedProduct.location, // The Canteen's location from the product
      products: [selectedProduct.id],
      datetime: new Date(data.datetime).toISOString(),
      status: data.status,
      schedule: {
        time: data.schedule_time,
        frequency: data.schedule_frequency,
      },
      note: data.note || null,
      service_type: "food",
    };
    createOrder(payload);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select a Nutrition Product</h3>

      {/* STEP 1: Product Selection UI */}
      {!selectedProduct && (
        <div className="space-y-2">
          <Input
            placeholder="Search for a meal item..."
            onChange={(e) => setProductSearch(e.target.value)}
          />
          {isLoadingProducts ? (
            <p>Loading products...</p>
          ) : (
            <ul className="max-h-48 overflow-y-auto border rounded-md bg-white">
              {productsData?.map((product: any) => (
                <li
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                >
                  {product.name} ({product.calories} kcal)
                </li>
              ))}
              {productsData?.length === 0 && <li className="p-2 text-gray-500">No products found.</li>}
            </ul>
          )}
        </div>
      )}

      {/* STEP 2: Order Detail Form UI (appears after a product is selected) */}
      {selectedProduct && (
        <Card className="mt-4 border-primary">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-600">{selectedProduct.quantity}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedProduct(null)}>
                Change Product
              </Button>
            </div>
            
            <hr className="my-4" />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* --- THIS IS THE DEFINITIVE FIX --- */}
                  {/* The 'control={form.control}' prop is now correctly added to all FormFields */}
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="on-hold">On Hold</SelectItem></SelectContent>
                    </Select><FormMessage/></FormItem>
                  )}/>
                  <FormField control={form.control} name="datetime" render={({ field }) => (
                    <FormItem><FormLabel>Start Date/Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage/></FormItem>
                  )}/>
                  <FormField control={form.control} name="schedule_time" render={({ field }) => (
                    <FormItem><FormLabel>Scheduled Time (HH:MM)</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage/></FormItem>
                  )}/>
                  <FormField control={form.control} name="schedule_frequency" render={({ field }) => (
                    <FormItem><FormLabel>Frequency</FormLabel><FormControl><Input placeholder="e.g., daily, weekly" {...field} /></FormControl><FormMessage/></FormItem>
                  )}/>
                  <FormField control={form.control} name="note" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                  )}/>
                  {/* ------------------------------------ */}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : "Save Nutrition Order"}
                    </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NutritionOrderQuestion;