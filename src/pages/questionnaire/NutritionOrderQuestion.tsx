import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { dietApi } from "../../api/dietApi";
import { allergyApi } from "../../api/allergyApi";
import { type NutritionProduct } from "../../types/nutrition_product";
import { request, queryString } from "../../api/request";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { 
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
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
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<NutritionProduct[]>([]);

  // Fetch patient allergies to display during order creation
  const { data: patientAllergies, isLoading: isLoadingAllergies } = useQuery({
    queryKey: ["patient_allergies", patientId],
    queryFn: () => allergyApi.getPatientAllergies(patientId, {
      excludeVerificationStatus: "entered_in_error",
      limit: 50
    }),
    select: (data) => data.results.filter(allergy => 
      allergy.clinical_status === "active" && 
      allergy.verification_status !== "refuted"
    ),
  });

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

    // Prepare patient allergies for point-in-time capture
    const capturedAllergies = patientAllergies?.map(allergy => ({
      id: allergy.id,
      code: allergy.code,
      category: allergy.category,
      criticality: allergy.criticality,
      clinical_status: allergy.clinical_status,
      verification_status: allergy.verification_status,
      captured_at: new Date().toISOString(), // Current timestamp for when allergies were captured
    })) || [];

    // Create the nutrition order data for structured questionnaire submission
    const nutritionOrderData = {
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
      patient_allergies: capturedAllergies, // Include point-in-time allergies
    };

    updateQuestionnaireResponseCB([{ type: "structured", value: [nutritionOrderData] }], question.id);
    
    // Reset form and selected products
    setSelectedProducts([]);
    form.reset();
    
    alert("Nutrition Order data has been added to the questionnaire!");
  };

  return (
    <div className="diet-container space-y-4 border p-4 rounded-lg mt-2 bg-white">
      {/* Patient Allergies Warning Section */}
      {isLoadingAllergies ? (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">Loading patient allergy information...</p>
        </div>
      ) : patientAllergies && patientAllergies.length > 0 ? (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ShieldAlert className="h-5 w-5" />
              Patient Allergies ({patientAllergies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-orange-700 mb-3">
              ⚠️ Please review the patient's known allergies before creating nutrition orders:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {patientAllergies.map((allergy) => (
                <div 
                  key={allergy.id} 
                  className="flex items-center justify-between p-2 bg-white rounded border border-orange-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {allergy.code.display}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Badge 
                        variant={allergy.category === 'food' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {allergy.category}
                      </Badge>
                      <Badge 
                        variant={allergy.criticality === 'high' ? 'destructive' : 'outline'}
                        className="text-xs"
                      >
                        {allergy.criticality} risk
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-orange-600 mt-3">
              These allergies will be automatically captured with this nutrition order for safety tracking.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">No known allergies on record for this patient.</p>
          </div>
        </div>
      )}

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
                  <Button type="submit" className="text-white">
                      Save Nutrition Order
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