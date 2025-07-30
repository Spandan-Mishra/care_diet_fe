import React from "react";
import { useQuery } from "@tanstack/react-query";
import { navigate } from "raviger";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dietApi } from "../../api/dietApi";
import type { NutritionProduct } from "../../types/nutrition_product";

const NutritionProductList: React.FC = () => {
  const facilityId = "2c50ae47-bea8-48e1-be5d-27daf87a1a89";

  const { data: response, isLoading } = useQuery({
    queryKey: ["nutrition_products", facilityId],
    queryFn: () => dietApi.listNutritionProducts({ facility: facilityId }),
    enabled: !!facilityId,
  });

  const products = response?.results || [];

  return (
    <div className="p-4">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Nutrition Products</h1>
            <p className="text-sm text-gray-600">
              Manage meal items and supplements for the facility.
            </p>
          </div>
          <Button
            onClick={() =>
              navigate(
                `/facility/${facilityId}/settings/nutrition-products/new`
              )
            }
          >
            Add New Product
          </Button>
        </div>

        {isLoading ? (
          <div className="p-4">Loading Products...</div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Calories (kcal)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: NutritionProduct) => (
                    <TableRow
                      key={product.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        navigate(
                          `/facility/${facilityId}/settings/nutrition-products/${product.id}/edit`
                        )
                      }
                    >
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.status}</TableCell>
                      <TableCell>{product.calories}</TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-gray-500 p-4"
                      >
                        No nutrition products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NutritionProductList;
