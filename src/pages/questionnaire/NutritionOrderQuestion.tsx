import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { navigate, usePathParams } from "raviger";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { dietApi, type NutritionOrderCreate } from "../../api/dietApi";
import { type NutritionProduct } from "../../types/nutrition_product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// This interface defines the props our component will receive from QuestionInput.tsx
interface NutritionOrderQuestionProps {
  facilityId: string;
  patientId: string;
  encounterId: string;
}

// This schema defines the fields for the form that appears *after* a product is selected.
const formSchema = z.object({
  status: z.enum(["active", "on-hold"]),
  datetime: z.string().min(1, "Date and time are required"),
  schedule_time: z.string().min(1, "Schedule time is required"),
  schedule_frequency: z.string().min(1, "Schedule frequency is required"),
  note: z.string().optional(),
});

type OrderFormData = z.infer<typeof formSchema>;

export const NutritionOrderQuestion: React.FC<NutritionOrderQuestionProps> = ({
  facilityId,
  patientId,
  encounterId,
}) => {
  const queryClient = useQueryClient();
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<NutritionProduct | null>(null);

  // Fetch a list of nutrition products for the search/autocomplete field.
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["nutrition_products", facilityId, productSearch],
    queryFn: () => dietApi.listNutritionProducts({ facility: facilityId, search: productSearch }),
  });

  const productOptions = useMemo(
    () => productsData?.results.map((product) => ({
      label: `${product.name} (${product.calories} kcal)`,
      value: product.id,
    })) || [],
    [productsData?.results]
  );

  const form = useForm<OrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: "active", schedule_frequency: "daily" },
  });

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: dietApi.createMealOrder,
    onSuccess: () => {
      alert("Nutrition Order created successfully!");
      queryClient.invalidateQueries({ queryKey: ["nutrition_orders", encounterId] });
      navigate(`/facility/${facilityId}/patient/${patientId}/encounter/${encounterId}`);
    },
    onError: (error: Error) => alert(error.message),
  });

  const handleProductSelect = (productId: string) => {
    const product = productsData?.results.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  const onSubmit = (data: OrderFormData) => {
    if (!selectedProduct) {
      alert("Please select a nutrition product.");
      return;
    }

    const payload: NutritionOrderCreate = {
      patient: patientId,
      encounter: encounterId,
      facility: facilityId,
      location: selectedProduct.location, // The Canteen Location from the product
      products: [selectedProduct.id],
      datetime: new Date(data.datetime).toISOString(),
      status: data.status,
      schedule: {
        time: data.schedule_time,
        frequency: data.schedule_frequency,
      },
      note: data.note || "",
      service_type: "food",
    };
    createOrder(payload);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select a Nutrition Product</h2>

      {selectedProduct && (
        <Card className="mt-4 border-primary-500">
          <CardContent className="p-4">
            <h3 className="text-xl font-bold mb-4">{selectedProduct.name}</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Form fields for status, datetime, schedule, and notes */}
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
                      <FormItem><FormLabel>Frequency</FormLabel><FormControl><Input placeholder="e.g., daily" {...field} /></FormControl><FormMessage/></FormItem>
                  )}/>
                  <FormField control={form.control} name="note" render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                  )}/>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="outline" onClick={() => setSelectedProduct(null)}>Cancel</Button>
                    <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Order"}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};