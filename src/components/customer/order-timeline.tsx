"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STATUS_STEPS = [
  { value: "PENDING", label: "Order Received" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
];

interface OrderTimelineProps {
  currentStatus: string;
  isDelivery: boolean;
}

export function OrderTimeline({ currentStatus, isDelivery }: OrderTimelineProps) {
  const steps = isDelivery
    ? STATUS_STEPS
    : STATUS_STEPS.filter((s) => s.value !== "OUT_FOR_DELIVERY");

  const currentIdx = steps.findIndex((s) => s.value === currentStatus);
  const isCancelled = currentStatus === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <span className="text-red-700 font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {steps.map((step, idx) => {
        const isCompleted = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step.value} className="flex items-start gap-3">
            {/* Line + Dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  isCompleted
                    ? "bg-primary border-primary"
                    : "bg-background border-muted-foreground/30"
                )}
              >
                {isCompleted && (
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                )}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-8 transition-all",
                    idx < currentIdx ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>

            {/* Label */}
            <div className="pb-8">
              <span
                className={cn(
                  "text-sm font-medium",
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
