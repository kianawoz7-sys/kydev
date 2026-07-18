import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary";

type ButtonStylesOptions = {
  variant?: ButtonVariant;
  className?: string;
};

export function buttonStyles({
  variant = "primary",
  className,
}: ButtonStylesOptions = {}) {
  return cn(
    "button-base",
    variant === "primary" ? "button-primary" : "button-secondary",
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, className })}
      type={type}
      {...props}
    />
  );
}
