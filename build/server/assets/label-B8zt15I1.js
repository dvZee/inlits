import { jsx } from "react/jsx-runtime";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { k as cn } from "./server-build-3vQ7_HUN.js";
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  LabelPrimitive.Root,
  {
    ref,
    className: cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    ),
    ...props
  }
));
Label.displayName = LabelPrimitive.Root.displayName;
export {
  Label as L
};
