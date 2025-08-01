import React from "react";
import { useQuery } from "@tanstack/react-query";
import { navigate, usePathParams } from "raviger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dietApi } from "../../api/dietApi";

const VIEW_ROUTE = "/facility/:facilityId/settings/nutrition_products/:productId";

const NutritionProductView: React.FC = () => {
const pathParams = usePathParams(VIEW_ROUTE);
  const facilityId = pathParams?.facilityId;
  const productId = "4c199a82-a6d3-4718-aedf-7627ecd36683";

  const { data: product, isLoading } = useQuery({
    queryKey: ["nutrition_product", productId],
    queryFn: () => dietApi.retrieveNutritionProduct(productId!),
    enabled: !!productId,
  });

  if (isLoading) return <div title="Loading..."><div className="p-4">Loading Product...</div></div>;
  if (!product) return <div title="Error"><div className="p-4">Product Not Found</div></div>;

  return (
    <div title={product.name}>
      <div className="container mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-sm text-gray-600">{product.code}</p>
          </div>
          <Button onClick={() => navigate(`/facility/${facilityId}/settings/nutrition_products/${productId}/edit`)}>
            Edit Product
          </Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div><p className="text-sm text-gray-500">Status</p><p className="capitalize">{product.status}</p></div>
            <div><p className="text-sm text-gray-500">Calories</p><p>{product.calories} kcal</p></div>
            <div><p className="text-sm text-gray-500">Serving Size</p><p>{product.quantity}</p></div>
            <div><p className="text-sm text-gray-500">Service Type</p><p className="capitalize">{product.service_type}</p></div>
            <div className="md:col-span-2"><p className="text-sm text-gray-500">Allergens</p><p>{product.allergens.join(', ') || 'None'}</p></div>
            <div className="md:col-span-2"><p className="text-sm text-gray-500">Notes</p><p>{product.note || 'N/A'}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NutritionProductView;