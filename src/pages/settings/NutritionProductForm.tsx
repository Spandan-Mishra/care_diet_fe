import React, { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { navigate, usePathParams } from "raviger";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dietApi, type NutritionProductCreate } from "../../api/dietApi";
import { billingApi } from "../../api/billingApi";
import { type ValueSetCoding } from "../../api/valuesetApi";
import AllergenMultiSelect from "../../components/ui/allergen-multi-select";
import { request, queryString } from "../../api/request";

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

const EDIT_ROUTE = "/facility/:facilityId/settings/nutrition_products/:productId/edit";
const CREATE_ROUTE = "/facility/:facilityId/settings/nutrition_products/new";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  quantity: z.string().min(1, "Serving Size is required"),
  calories: z.coerce.number().int().min(0, "Must be a positive number"),
  status: z.enum(["active", "inactive", "entered-in-error"]),
  location: z.string().uuid("A valid Location UUID must be provided"),
  allergens: z.array(z.object({
    system: z.string(),
    code: z.string(),
    display: z.string(),
  })).default([]),
  charge_item_definition: z.string().optional().nullable(),
  note: z.string().optional(),
});

type ProductFormData = z.infer<typeof formSchema>;

const NutritionProductForm: React.FC = () => {
  const editParams = usePathParams(EDIT_ROUTE);
  const createParams = usePathParams(CREATE_ROUTE);
  
  const facilityId = editParams?.facilityId || createParams?.facilityId;
  const productId = editParams?.productId;
  const isEditMode = !!productId;
  
  const queryClient = useQueryClient();

  // Fetch facility locations
  const { data: facilityLocations } = useQuery({
    queryKey: ["facility_locations", facilityId],
    queryFn: () => locationApi.list(facilityId!),
    enabled: !!facilityId,
  });

  // Fetch active charge item definitions for billing
  const { data: chargeItemDefinitions } = useQuery({
    queryKey: ["charge_item_definitions", facilityId],
    queryFn: () => billingApi.listChargeItemDefinitions({ facility: facilityId!, status: "active" }),
    enabled: !!facilityId,
  });

  const { data: existingData, isLoading: isDataLoading } = useQuery({
    queryKey: ["nutrition_product", productId],
    queryFn: () => dietApi.retrieveNutritionProduct(productId!),
    enabled: isEditMode,
  });

  const locationOptions = useMemo(
    () =>
      facilityLocations?.map((location: Location) => ({
        label: location.name,
        value: location.id,
      })) || [],
    [facilityLocations],
  );

  const chargeItemDefinitionOptions = useMemo(
    () =>
      chargeItemDefinitions?.results?.map((cid) => ({
        label: `${cid.title} - ${cid.description || ''}`,
        value: cid.id,
      })) || [],
    [chargeItemDefinitions],
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      status: "active" as const, 
      allergens: [] as ValueSetCoding[],
      name: "",
      charge_item_definition: "none",
      code: "",
      quantity: "",
      calories: 0,
      location: "", // Will be set when locations are loaded
      note: ""
    },
  });

  useEffect(() => {
    if (existingData) {
      // Convert legacy allergen data to valueset format if needed
      let allergens: ValueSetCoding[] = [];
      if (existingData.allergens) {
        if (Array.isArray(existingData.allergens) && existingData.allergens.length > 0) {
          // Check if it's already in the new format (ValueSetCoding objects)
          if (typeof existingData.allergens[0] === 'object' && 'system' in existingData.allergens[0]) {
            allergens = existingData.allergens as ValueSetCoding[];
          } else {
            // Legacy format: convert string array to placeholder coding objects
            allergens = (existingData.allergens as unknown as string[]).map(allergen => ({
              system: "legacy",
              code: allergen.toLowerCase().replace(/\s+/g, "-"),
              display: allergen
            }));
          }
        }
      }

      form.reset({
        name: existingData.name,
        code: existingData.code,
        quantity: existingData.quantity,
        calories: existingData.calories,
        status: existingData.status,
        location: existingData.location,
        allergens,
        charge_item_definition: existingData.charge_item_definition || "none",
        note: existingData.note ?? undefined,
      });
    }
  }, [existingData, form]);

  // Set default location for new products when locations are loaded
  useEffect(() => {
    if (!isEditMode && locationOptions && locationOptions.length > 0 && !form.getValues("location")) {
      // Set the first available location as default for new products
      form.setValue("location", locationOptions[0].value);
    }
  }, [locationOptions, isEditMode, form]);

  const { mutate: createOrUpdateProduct, isPending, error: mutationError } = useMutation({
    mutationFn: (data: NutritionProductCreate) => {
      return isEditMode
        ? dietApi.updateNutritionProduct(productId!, data)
        : dietApi.createNutritionProduct(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["nutrition_products", facilityId] });
      navigate(`/facility/${facilityId}/settings/nutrition_products/${data.id}`);
    },
    onError: (error: Error) => {
      console.error("Error submitting form:", error);
      alert(error.message || "An error occurred while saving the product");
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (!facilityId) return;

    // Validate location is selected and valid
    if (!data.location || data.location === "no_locations") {
      alert("Please select a valid facility location");
      return;
    }

    // Validate that the selected location exists in the available locations
    if (locationOptions && !locationOptions.some((loc) => loc.value === data.location)) {
      alert("Selected location is no longer available. Please select a different location.");
      return;
    }

    const payload: NutritionProductCreate = {
      ...data,
      allergens: data.allergens,
      note: data.note || null,
      charge_item_definition: data.charge_item_definition === "none" || data.charge_item_definition === undefined ? null : data.charge_item_definition,
      facility: facilityId,
      service_type: "food",
    };
    createOrUpdateProduct(payload);
  };

  if (!facilityId) {
    return <div className="p-4">Invalid facility ID</div>;
  }

  if (isEditMode && isDataLoading) return <div title="Loading..."><div className="p-4">Loading Form...</div></div>;

  return (
    <div className="diet-container overflow-visible" title={isEditMode ? "Edit Product" : "Create Product"}>
      <div className="container mx-auto max-w-3xl overflow-visible">
        <h1 className="text-2xl font-bold mb-4">{isEditMode ? "Edit Nutrition Product" : "Create New Product"}</h1>
        {mutationError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {mutationError instanceof Error ? mutationError.message : "Unknown error"}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 overflow-visible">
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="name" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Product Name*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="code" render={({ field }) => (
                  <FormItem><FormLabel>Code*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
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
                    <div className="text-sm text-gray-600">
                      Select the facility location where this nutrition product will be available
                    </div>
                    <FormMessage /></FormItem>
                )}/>
                
                <FormField name="charge_item_definition" render={({ field }) => (
                  <FormItem><FormLabel>Charge Item Definition</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "none" ? null : value)} value={field.value || "none"}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select charge item definition (optional)" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (No billing)</SelectItem>
                        {chargeItemDefinitionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-gray-600">
                      Select a charge item definition for billing this nutrition product
                    </div>
                    <FormMessage /></FormItem>
                )}/>
                
                 <FormField name="calories" render={({ field }) => (
                  <FormItem><FormLabel>Calories (kcal)*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="quantity" render={({ field }) => (
                  <FormItem><FormLabel>Serving Size*</FormLabel><FormControl><Input placeholder="e.g., 1 plate" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader><CardTitle>Additional Details</CardTitle></CardHeader>
              <CardContent className="space-y-4 overflow-visible pb-8">
                <FormField name="allergens" render={({ field }) => (
                  <FormItem className="relative overflow-visible mb-6">
                    <FormControl>
                      <div className="w-full overflow-visible">
                        <AllergenMultiSelect
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select allergens from medical terminology..."
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField name="note" render={({ field }) => (
                    <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(`/facility/${facilityId}/settings/nutrition_products`)}>Cancel</Button>
              <Button 
                className="text-white" 
                type="submit" 
                disabled={isPending || !locationOptions || locationOptions.length === 0}
              >
                {isPending ? "Saving..." : 
                 !locationOptions ? "Loading..." :
                 locationOptions.length === 0 ? "No locations available" :
                 "Save Product"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NutritionProductForm;