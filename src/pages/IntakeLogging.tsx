import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Calendar, MapPin, Clock } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

import { dietApi, type NutritionIntakeCreate } from "../api/dietApi";
import type { NutritionOrder } from "../types/nutrition_order";

interface IntakeLoggingProps {
  facilityId: string;
  locationId: string;
}

const CONSUMPTION_STATUS_OPTIONS = [
  { value: "completed", label: "Fully Consumed" },
  { value: "in-progress", label: "Partially Consumed" },
  { value: "not-done", label: "Not Consumed" },
  { value: "stopped", label: "Refused" },
  { value: "entered-in-error", label: "Wasted" },
];

const STATUS_COLORS = {
  completed: "default",
  "in-progress": "secondary", 
  "not-done": "destructive",
  stopped: "destructive",
  "entered-in-error": "secondary",
} as const;

const intakeSchema = z.object({
  nutrition_order_id: z.string().min(1, "Nutrition order is required"),
  status: z.string().min(1, "Consumption status is required"),
  status_reason: z.string().optional(),
  intake_items: z.array(z.object({
    product_id: z.string(),
    name: z.string().optional(),
    quantity: z.string().min(1, "Consumed quantity is required"),
    original_quantity: z.string().optional(),
  })).min(1, "At least one intake item is required"),
  occurrence_datetime: z.string().min(1, "Date and time is required"),
  note: z.string().optional(),
});

type IntakeFormData = z.infer<typeof intakeSchema>;

interface IntakeItem {
  product_id: string;
  name?: string;
  quantity: string;
  original_quantity?: string;
}

export default function IntakeLogging({ facilityId, locationId }: IntakeLoggingProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNutritionOrder, setSelectedNutritionOrder] = useState<NutritionOrder | null>(null);
  const [selectedItems, setSelectedItems] = useState<IntakeItem[]>([]);

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      nutrition_order_id: "",
      status: "completed",
      status_reason: "",
      intake_items: [],
      occurrence_datetime: new Date().toISOString().slice(0, 16),
      note: "",
    },
  });

  // Fetch all nutrition orders for the facility (canteen orders)
  const { data: nutritionOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["canteen-orders", facilityId],
    queryFn: () => dietApi.listCanteenOrders({ facility: facilityId }),
    enabled: !!facilityId,
  });

  // Fetch existing intake logs
  const { data: intakeLogsData, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["intake-logs", facilityId, locationId],
    queryFn: () => dietApi.listIntakeLogs({ facility: facilityId, location: locationId }),
    enabled: !!facilityId && !!locationId,
  });

  const createIntakeLogMutation = useMutation({
    mutationFn: dietApi.createIntakeLog,
    onSuccess: () => {
      toast.success("Intake log created successfully");
      queryClient.invalidateQueries({ queryKey: ["intake-logs"] });
      setIsDialogOpen(false);
      form.reset();
      setSelectedItems([]);
      setSelectedNutritionOrder(null);
    },
    onError: (error) => {
      console.error("Error creating intake log:", error);
      toast.error("Failed to create intake log");
    },
  });

  const onSubmit = (data: IntakeFormData) => {
    if (!selectedNutritionOrder) {
      toast.error("Please select a nutrition order");
      return;
    }

    const intakeData: NutritionIntakeCreate = {
      patient: typeof selectedNutritionOrder.patient === 'string' 
        ? selectedNutritionOrder.patient 
        : selectedNutritionOrder.patient.id,
      encounter: typeof selectedNutritionOrder.encounter === 'string' 
        ? selectedNutritionOrder.encounter 
        : selectedNutritionOrder.encounter.id,
      facility: facilityId,
      service_type: "food",
      status: data.status,
      status_reason: data.status_reason ?? null,
      intake_items: selectedItems.map(item => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
      })),
      occurrence_datetime: data.occurrence_datetime,
      note: data.note ?? null,
    };
    
    createIntakeLogMutation.mutate(intakeData);
  };

  const selectNutritionOrder = (order: NutritionOrder) => {
    setSelectedNutritionOrder(order);
    form.setValue("nutrition_order_id", order.id);
    
    // Pre-populate intake items from nutrition order products
    // Since products appear to be just IDs, we'll handle them appropriately
    const orderItems: IntakeItem[] = Array.isArray(order.products) 
      ? order.products.map((product, index) => ({
          product_id: typeof product === 'string' ? product : product.id,
          name: typeof product === 'object' && product.name ? product.name : `Product ${index + 1}`,
          quantity: "0", // Default to 0, staff will input actual consumed quantity
          original_quantity: typeof product === 'object' && product.quantity ? product.quantity.toString() : "1",
        }))
      : [];
    
    setSelectedItems(orderItems);
    form.setValue("intake_items", orderItems);
    setIsDialogOpen(true); // Open the dialog when order is selected
  };

  const updateItemQuantity = (productId: string, quantity: string) => {
    const updatedItems = selectedItems.map(item => 
      item.product_id === productId ? { ...item, quantity } : item
    );
    setSelectedItems(updatedItems);
    form.setValue("intake_items", updatedItems);
  };

  const removeIntakeItem = (productId: string) => {
    const updatedItems = selectedItems.filter(item => item.product_id !== productId);
    setSelectedItems(updatedItems);
    form.setValue("intake_items", updatedItems);
  };

  const filteredOrders = nutritionOrders?.results || [];
  console.log(filteredOrders)

  const intakeLogs = intakeLogsData?.results || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Intake Logging</h1>
          <p className="text-sm text-gray-600 mt-1">
            Log food consumption for nutrition orders
          </p>
        </div>
      </div>

      {/* Nutrition Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Orders - Select to Log Intake</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
            <div className="text-center py-8">Loading nutrition orders...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No nutrition orders found for this facility
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">#{order.id.slice(-6)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span>Patient ID: {typeof order.patient === 'string' ? order.patient.slice(-6) : order.patient?.name || "Unknown Patient"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              {new Date(order.datetime).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(order.datetime).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {Array.isArray(order.products) ? order.products.length : (typeof order.products === 'string' ? 1 : 0)} items
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <span className="text-sm">Loc ID: {typeof order.location === 'string' ? order.location.slice(-6) : order.location?.name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="text-white"
                            onClick={() => selectNutritionOrder(order)}
                          >
                            Log Intake
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intake Logging Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Create Intake Log</DialogTitle>
            <DialogDescription>
              Log food consumption for the selected nutrition order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Selected Order Info */}
                {selectedNutritionOrder && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">Selected Order</h3>
                        <div className="space-y-1 text-sm text-blue-800">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Patient ID: {typeof selectedNutritionOrder.patient === 'string' ? selectedNutritionOrder.patient.slice(-6) : selectedNutritionOrder.patient?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>Location ID: {typeof selectedNutritionOrder.location === 'string' ? selectedNutritionOrder.location.slice(-6) : selectedNutritionOrder.location?.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Order Date: {new Date(selectedNutritionOrder.datetime).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Consumption Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Overall Consumption Status *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select consumption status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONSUMPTION_STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date and Time */}
                    <FormField
                      control={form.control}
                      name="occurrence_datetime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date and Time of Consumption *</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status Reason */}
                    <FormField
                      control={form.control}
                      name="status_reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Reason</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Reason for consumption status (optional)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes about the intake (optional)"
                              rows={6}
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Products and Quantities */}
                <div className="space-y-4">
                  <h4 className="font-medium">Food Items Consumption</h4>
                  {selectedItems.length > 0 ? (
                    <div className="space-y-3">
                      {selectedItems.map((item, index) => (
                        <div key={item.product_id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium">Item #{index + 1}</h5>
                              <p className="text-sm text-gray-600 mt-1">
                                Product ID: {item.product_id.slice(-8)} | 
                                Original quantity: {item.original_quantity || "1"}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-end">
                                <label className="text-xs text-gray-600 mb-1">Consumed</label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  placeholder="0"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(item.product_id, e.target.value)}
                                  className="w-20 text-center"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                onClick={() => removeIntakeItem(item.product_id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No food items in selected order</p>
                  )}
                </div>
              </form>
            </Form>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedNutritionOrder(null);
                setSelectedItems([]);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createIntakeLogMutation.isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {createIntakeLogMutation.isPending ? "Creating..." : "Create Intake Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Existing Intake Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Intake Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="text-center py-8">Loading intake logs...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Logged By</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intakeLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No intake logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    intakeLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.patient?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {new Date(log.occurrence_datetime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_COLORS[log.status as keyof typeof STATUS_COLORS] || "secondary"}>
                            {CONSUMPTION_STATUS_OPTIONS.find(opt => opt.value === log.status)?.label || log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {log.intake_items?.map((item, idx) => (
                              <div key={idx}>
                                {item.name}: {item.quantity}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.logged_by?.username || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {log.note || "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
