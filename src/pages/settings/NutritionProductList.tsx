import React from "react";
import { useQuery } from "@tanstack/react-query";
import { navigate, usePathParams } from "raviger";
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

const LIST_ROUTE = "/facility/:facilityId/settings/nutrition_products";

const NutritionProductList: React.FC = () => {
  const pathParams = usePathParams(LIST_ROUTE);
  const facilityId = pathParams?.facilityId;

  const { data: response, isLoading } = useQuery({
    queryKey: ["nutrition_products", facilityId],
    queryFn: () => dietApi.listNutritionProducts({ facility: facilityId! }),
    enabled: !!facilityId,
  });

  const products = response?.results || [];

  if (!facilityId) {
    return <div className="p-4">Invalid facility ID</div>;
  }

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
            className="text-white"
            onClick={() =>
              navigate(
                `/facility/${facilityId}/settings/nutrition_products/new`
              )
            }
          >
            Add New Product
          </Button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Name</TableHead>
                    <TableHead className="text-center">Code</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Calories (kcal)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: NutritionProduct) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.code}</TableCell>
                      <TableCell className="capitalize">{product.status}</TableCell>
                      <TableCell>{product.calories}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/facility/${facilityId}/settings/nutrition_products/${product.id}`
                            )
                          }
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
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