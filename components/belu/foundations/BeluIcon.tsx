import type { SVGProps } from "react";
import { beluIconPaths, type BeluIconName } from "./icons";

export type BeluIconProps = {
  name: BeluIconName;
  size?: number;
  className?: string;
  "aria-hidden"?: SVGProps<SVGSVGElement>["aria-hidden"];
};

export function BeluIcon({
  name,
  size = 20,
  className,
  "aria-hidden": ariaHidden = true,
}: BeluIconProps) {
  return (
    <svg
      aria-hidden={ariaHidden}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {beluIconPaths[name]}
    </svg>
  );
}
