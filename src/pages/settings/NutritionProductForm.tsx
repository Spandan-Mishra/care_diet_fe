import React, { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { navigate, usePathParams } from "raviger";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
} from "@/components/ui/form";
import { dietApi, type NutritionProductCreate } from "../../api/dietApi";

const NEW_PRODUCT_ROUTE = "/facility/:facilityId/settings/nutrition-products/new";

// This schema defines the form fields the user interacts with.
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  quantity: z.string().min(1, "Serving Size is required"),
  calories: z.coerce.number().int().min(0, "Calories must be a positive number"),
  status: z.enum(["active", "inactive", "entered-in-error"]),
  location: z.string().uuid("A valid Canteen Location UUID must be provided"),
});

const NutritionProductForm: React.FC = () => {
  const pathParams = usePathParams(NEW_PRODUCT_ROUTE);
  const facilityId = pathParams?.facilityId;

  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: "active" },
  });

  const { mutate: createProduct, isPending } = useMutation({
    mutationFn: dietApi.createNutritionProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition_products", facilityId] });
      if (facilityId) {
        navigate(`/facility/${facilityId}/settings/nutrition-products`);
      }
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!facilityId) return;
    const payload: NutritionProductCreate = {
      ...data,
      facility: facilityId,
      service_type: "food",
      allergens: [],
      note: "",
    };
    createProduct(payload);
  };

  const canteenLocationId = "YOUR_CANTEEN_LOCATION_UUID_HERE";
  if (canteenLocationId === "YOUR_CANTEEN_LOCATION_UUID_HERE") {
    return (
      <div className="p-4 text-red-500 font-bold text-lg">
        Developer Action Required: Please open `NutritionProductForm.tsx` and replace the placeholder `canteenLocationId`.
      </div>
    );
  }
  useEffect(() => form.setValue("location", canteenLocationId), [canteenLocationId, form]);

  if (!facilityId) {
    return <div><div className="p-4">Loading facility information...</div></div>;
  }

  return (
    <div className="p-4">
      <div className="container mx-auto max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Create New Nutrition Product</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(`/facility/${facilityId}/settings/nutrition-products`)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Product"}</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NutritionProductForm;