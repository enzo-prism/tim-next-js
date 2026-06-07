"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ className, style, ...props }: ToasterProps) {
  const toasterClassName = ["toaster group", className].filter(Boolean).join(" ");

  return (
    <div
      data-testid="toast-viewport"
      style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }}
    >
      <Sonner
        {...props}
        theme="light"
        className={toasterClassName}
        style={{ pointerEvents: "auto", ...style }}
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-sm",
            description: "group-[.toast]:text-muted-foreground",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
      />
    </div>
  );
}

export { Toaster };
