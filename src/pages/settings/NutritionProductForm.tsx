import React, { useEffect } from "react";
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

const FORM_ROUTE = "/facility/:facilityId/settings/nutrition_products/:productId/edit";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  quantity: z.string().min(1, "Serving Size is required"),
  calories: z.coerce.number().int().min(0, "Must be a positive number"),
  status: z.enum(["active", "inactive", "entered-in-error"]),
  location: z.string().uuid("A valid Canteen Location UUID must be provided"),
  allergens: z.string().optional(),
  note: z.string().optional(),
});

type ProductFormData = z.infer<typeof formSchema>;

const NutritionProductForm: React.FC = () => {
  const pathParams = usePathParams(FORM_ROUTE);
  const facilityId = pathParams?.facilityId;
  const productId = pathParams?.productId;
  const isEditMode = !!productId;
  
  const queryClient = useQueryClient();

  const { data: existingData, isLoading: isDataLoading } = useQuery({
    queryKey: ["nutrition_product", productId],
    queryFn: () => dietApi.retrieveNutritionProduct(productId!),
    enabled: isEditMode,
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      status: "active", 
      allergens: "",
      name: "",
      code: "",
      quantity: "",
      calories: 0,
      location: "",
      note: ""
    },
  });

  useEffect(() => {
    if (existingData) {
      form.reset({
        name: existingData.name,
        code: existingData.code,
        quantity: existingData.quantity,
        calories: existingData.calories,
        status: existingData.status,
        location: existingData.location,
        allergens: existingData.allergens?.join(", ") || "",
        note: existingData.note ?? undefined,
      });
    }
  }, [existingData, form]);

  const { mutate: createOrUpdateProduct, isPending } = useMutation({
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
      alert(error);
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!facilityId) return;

    const payload: NutritionProductCreate = {
      ...data,
      allergens: data.allergens ? data.allergens.split(',').map((item : string) => item.trim()) : [],
      note: data.note || null,
      facility: facilityId,
      service_type: "food",
    };
    createOrUpdateProduct(payload);
  };
  
  const canteenLocationId = "77a8b1ac-fdff-4f14-a112-09ae58c220b4";
  // if (canteenLocationId === "YOUR_CANTEEN_LOCATION_UUID_HERE") {
  //   return <div className="p-4 text-red-500 font-bold">Developer Action: Set a valid Canteen Location UUID in NutritionProductForm.tsx</div>;
  // }
  useEffect(() => form.setValue("location", canteenLocationId), [canteenLocationId, form]);

  if (!facilityId) {
    return <div className="p-4">Invalid facility ID</div>;
  }

  if (isDataLoading) return <div title="Loading..."><div className="p-4">Loading Form...</div></div>;

  return (
    <div className="diet-container" title={isEditMode ? "Edit Product" : "Create Product"}>
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">{isEditMode ? "Edit Nutrition Product" : "Create New Product"}</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                 <FormField name="calories" render={({ field }) => (
                  <FormItem><FormLabel>Calories (kcal)*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="quantity" render={({ field }) => (
                  <FormItem><FormLabel>Serving Size*</FormLabel><FormControl><Input placeholder="e.g., 1 plate" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Additional Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField name="allergens" render={({ field }) => (
                    <FormItem><FormLabel>Allergens</FormLabel><FormControl><Input placeholder="e.g., gluten, nuts, soy" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="note" render={({ field }) => (
                    <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(`/facility/${facilityId}/settings/nutrition_products`)}>Cancel</Button>
              <Button className="text-white" type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Product"}</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NutritionProductForm;