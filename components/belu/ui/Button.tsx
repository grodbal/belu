"use client";

import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";
import styles from "./ui.module.css";

type ButtonCommonProps = {
  children: ReactNode;
  className?: string;
};

type ActionButtonProps = ButtonCommonProps & {
  href?: undefined;
  disabled?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

type NavigationButtonProps = ButtonCommonProps & {
  href: string;
  disabled?: never;
  type?: never;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export type ButtonProps = ActionButtonProps | NavigationButtonProps;

type ButtonVariant = "primary" | "secondary";

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function Button({
  variant,
  className,
  children,
  ...props
}: ButtonProps & { variant: ButtonVariant }) {
  const buttonClassName = joinClassNames(
    styles.button,
    styles[variant],
    className,
  );

  if (props.href !== undefined) {
    const { href, onClick } = props;

    return (
      <Link className={buttonClassName} href={href} onClick={onClick}>
        {children}
      </Link>
    );
  }

  const { disabled, onClick, type = "button" } = props;

  return (
    <button
      className={buttonClassName}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props: ButtonProps) {
  return <Button variant="secondary" {...props} />;
}
