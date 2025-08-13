
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { dietApi, type NutritionOrderCreate } from "../../api/dietApi";
import { type NutritionProduct } from "../../types/nutrition_product";
import { request, queryString } from "../../api/request";
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
import Autocomplete from "../../components/ui/autocomplete";

interface Location {
  id: string;
  name: string;
}

const locationApi = {
  list: async (facilityId: string): Promise<Location[]> => {
    try {
      const response = await request<{results: Location[]}>(`/api/v1/facility/${facilityId}/location/${queryString({ limit: 100 })}`);
      return response.results;
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      return [
        { id: "main-kitchen", name: "Main Kitchen" },
        { id: "north-canteen", name: "North Canteen" },
        { id: "south-canteen", name: "South Canteen" },
        { id: "central-kitchen", name: "Central Kitchen" },
      ];
    }
  },
};

export interface NutritionOrderQuestionProps {
  facilityId: string;
  patientId: string;
  encounterId: string;
  question: { id: string };
  updateQuestionnaireResponseCB: (values: any[], questionId: string) => void;
}

const formSchema = z.object({
  status: z.enum(["active", "on-hold"]),
  datetime: z.string().min(1, "Date and time are required"),
  schedule_time: z.string().min(1, "Schedule time is required"),
  schedule_frequency: z.string().min(1, "Schedule frequency is required"),
  location: z.string().min(1, "Location is required"),
  note: z.string().optional(),
});

type OrderFormData = z.infer<typeof formSchema>;

const NutritionOrderQuestion: React.FC<NutritionOrderQuestionProps> = ({
  facilityId,
  patientId,
  encounterId,
  question,
  updateQuestionnaireResponseCB,
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

  const { data: locations } = useQuery({
    queryKey: ["locations", facilityId],
    queryFn: () => locationApi.list(facilityId),
  });

  const form = useForm<OrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      status: "active", 
      schedule_frequency: "daily",
      datetime: "",
      schedule_time: "",
      location: "",
      note: ""
    },
  });

  const nutritionProductOptions = useMemo(
    () =>
      productsData?.map((product) => ({
        label: `${product.name} (${product.calories} kcal)`,
        value: product.id,
      })) || [],
    [productsData],
  );

  const locationOptions = useMemo(
    () =>
      locations?.map((location: Location) => ({
        label: location.name,
        value: location.id,
      })) || [],
    [locations],
  );

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: dietApi.createMealOrder,
    onSuccess: (data) => {
      updateQuestionnaireResponseCB([{ type: "structured", value: data.id }], question.id);
      alert("Nutrition Order created successfully!");
      queryClient.invalidateQueries({ queryKey: ["nutrition_orders", encounterId] });
      setSelectedProduct(null);
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
      location: data.location,
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
    <div className="diet-container space-y-4 border p-4 rounded-lg mt-2 bg-white">
      {!selectedProduct && (
        <div className="space-y-2">
          <h3 className="font-semibold">Select a Nutrition Product</h3>
          <Autocomplete
            options={nutritionProductOptions}
            value=""
            onChange={(value: string) => {
              const product = productsData?.find(p => p.id === value);
              if (product) setSelectedProduct(product);
            }}
            onSearch={setProductSearch}
            placeholder="Choose a nutrition product..."
            inputPlaceholder="Search for a meal item..."
            noOptionsMessage="No products found."
            disabled={isLoadingProducts}
          />
        </div>
      )}

      {selectedProduct && (
        <Card className="border-green-500">
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
                  <FormField name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="on-hold">On Hold</SelectItem></SelectContent>
                    </Select><FormMessage/></FormItem>
                  )}/>
                  <FormField name="datetime" render={({ field }) => (
                    <FormItem><FormLabel>Start Date/Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage/></FormItem>
                  )}/>
                  <FormField name="schedule_time" render={({ field }) => (
                    <FormItem><FormLabel>Scheduled Time (HH:MM)</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage/></FormItem>
                  )}/>
                  <FormField name="schedule_frequency" render={({ field }) => (
                    <FormItem><FormLabel>Frequency</FormLabel><FormControl><Input placeholder="e.g., daily, weekly" {...field} /></FormControl><FormMessage/></FormItem>
                  )}/>
                  <FormField name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {locationOptions.map((location: {label: string, value: string}) => (
                            <SelectItem key={location.value} value={location.value}>
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <FormMessage/>
                    </FormItem>
                  )}/>
                  <FormField name="note" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                  )}/>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button type="submit" className="text-white" disabled={isPending}>
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