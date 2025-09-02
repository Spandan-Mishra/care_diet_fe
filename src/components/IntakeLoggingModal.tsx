import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { dietApi, type NutritionIntakeCreate } from "../api/dietApi";

const CONSUMPTION_STATUS_OPTIONS = [
  { value: "completed", label: "Fully Consumed" },
  { value: "in-progress", label: "Partially Consumed" },
  { value: "not-done", label: "Not Consumed" },
  { value: "stopped", label: "Refused" },
  { value: "entered-in-error", label: "Wasted" },
];

const intakeSchema = z.object({
  status: z.string().min(1, "Consumption status is required"),
  status_reason: z.string().optional(),
  intake_items: z.array(z.object({
    product_id: z.string(),
    name: z.string().optional(),
    quantity: z.string().min(1, "Consumed quantity is required"),
  })),
  occurrence_datetime: z.string().min(1, "Occurrence time is required"),
  note: z.string().optional(),
});

type IntakeFormData = z.infer<typeof intakeSchema>;

interface IntakeLoggingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nutritionOrder: any;
  facilityId: string;
}

const IntakeLoggingModal: React.FC<IntakeLoggingModalProps> = ({
  open,
  onOpenChange,
  nutritionOrder,
  facilityId,
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      status: "",
      status_reason: "",
      intake_items: nutritionOrder?.products?.map((product: any) => ({
        product_id: product.id,
        name: product.name,
        quantity: "",
      })) || [],
      occurrence_datetime: new Date().toISOString().slice(0, 16),
      note: "",
    },
  });

  const createIntakeMutation = useMutation({
    mutationFn: (data: NutritionIntakeCreate) => dietApi.createIntakeLog(data),
    onSuccess: () => {
      toast.success("Intake log created successfully");
      
      queryClient.invalidateQueries({ queryKey: ["nutrition_orders"] });
      queryClient.invalidateQueries({ queryKey: ["intake_logs"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Failed to create intake log: " + (error.message || "Unknown error"));
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: IntakeFormData) => {
    if (!nutritionOrder) return;
    
    setIsSubmitting(true);
    
    const intakeData: NutritionIntakeCreate = {
      patient: nutritionOrder.patient.id || nutritionOrder.patient,
      encounter: nutritionOrder.encounter.id || nutritionOrder.encounter,
      facility: facilityId,
      // nutrition_order: nutritionOrder.id, // We can add this back later when the backend supports it
      service_type: "food",
      status: data.status,
      status_reason: data.status_reason || "",
      intake_items: data.intake_items,
      occurrence_datetime: data.occurrence_datetime,
      note: data.note || "",
    };

    createIntakeMutation.mutate(intakeData);
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const currentItems = form.getValues("intake_items");
    currentItems[index].quantity = quantity;
    form.setValue("intake_items", currentItems);
  };

  if (!nutritionOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Log Nutrition Intake</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Patient</label>
                <div className="text-sm text-gray-600">
                  {nutritionOrder.patient?.name || nutritionOrder.patient}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Nutrition Order</label>
                <div className="text-sm text-gray-600">
                  {nutritionOrder.products?.map((p: any) => p.name).join(", ") || "N/A"}
                </div>
              </div>
            </div>

            <FormField
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumption Status</FormLabel>
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

            <FormField
              name="status_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Reason (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Reason for status" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="occurrence_datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occurrence Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <label className="text-sm font-medium">Products Consumed</label>
              <div className="space-y-3 mt-2">
                {nutritionOrder.products?.map((product: any, index: number) => (
                  <div key={product.id || index} className="flex items-center gap-4 p-3 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Original Quantity: {product.quantity}
                      </div>
                    </div>
                    <div className="w-32">
                      <Input
                        placeholder="Consumed"
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        defaultValue={form.getValues(`intake_items.${index}.quantity`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="text-white">
                {isSubmitting ? "Logging..." : "Log Intake"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IntakeLoggingModal;
