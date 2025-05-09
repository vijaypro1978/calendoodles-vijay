
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex border rounded-md overflow-hidden",
          className
        )}
        {...props}
      >
        {React.Children.map(props.children, (child) => {
          // Check if child is a valid React element
          if (React.isValidElement(child)) {
            // Create a properly typed clone with merged className
            return React.cloneElement(child, {
              // Correctly type the props to include className
              ...child.props,
              className: cn(
                child.props.className,
                "rounded-none border-none first:rounded-l-md last:rounded-r-md -ml-[1px] first:ml-0"
              ),
            });
          }
          return child;
        })}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
