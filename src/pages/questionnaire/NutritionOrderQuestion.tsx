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
  const [selectedProducts, setSelectedProducts] = useState<NutritionProduct[]>([]);

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
      setSelectedProducts([]);
      form.reset();
    },
    onError: (error: Error) => alert(error.message),
  });

  const addProduct = (productId: string) => {
    const product = productsData?.find(p => p.id === productId);
    if (product && !selectedProducts.some(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const onSubmit = (data: OrderFormData) => {
    if (selectedProducts.length === 0) {
      alert("Please add at least one nutrition product.");
      return;
    }
    const payload: NutritionOrderCreate = {
      patient: patientId,
      encounter: encounterId,
      facility: facilityId,
      location: data.location,
      products: selectedProducts.map(p => p.id),
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
      <div className="space-y-2">
        <h3 className="font-semibold">Add Nutrition Products</h3>
        <Autocomplete
          options={nutritionProductOptions}
          value=""
          onChange={addProduct}
          onSearch={setProductSearch}
          placeholder="Choose a nutrition product..."
          inputPlaceholder="Search for a meal item..."
          noOptionsMessage="No products found."
          disabled={isLoadingProducts}
        />
        {selectedProducts.length > 0 && (
          <div className="mt-2">
            <h4 className="font-semibold mb-1">Selected Products:</h4>
            <ul className="space-y-1">
              {selectedProducts.map(product => (
                <li key={product.id} className="flex items-center justify-between border p-2 rounded">
                  <div>
                    <span className="font-bold">{product.name}</span>
                    <span className="ml-2 text-sm text-gray-600">{product.quantity}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeProduct(product.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Card className="border-green-500">
        <CardContent className="p-4">
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
    </div>
  );
};

export default NutritionOrderQuestion;