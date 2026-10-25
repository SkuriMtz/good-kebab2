"use client";

import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button";
import { choosePlan } from "./waitlist-form";

/** Baja a la lista de espera con el plan ya elegido (One o Max). Es un ancla: sin JS también funciona. */
export function PlanLink({ plan, children }: { plan: "one" | "max"; children: ReactNode }) {
  return (
    <a href="#lista" onClick={() => choosePlan(plan)} className={buttonClasses("secondary", "lg", "-ml-[18px] light:ml-0 light:w-full lg:w-auto")}>
      {children}
    </a>
  );
}
