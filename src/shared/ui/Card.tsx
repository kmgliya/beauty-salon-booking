import { ReactNode } from "react";
import clsx from "clsx";

export const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={clsx("card", className)}>{children}</div>;
