"use client";

import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
} from "next/navigation";
import React from "react";

type LinkProps = React.ComponentPropsWithoutRef<typeof NextLink> & {
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  ariaLabel?: string;
};

export function Link({ children, ...props }: LinkProps) {
  return <NextLink {...props}>{children}</NextLink>;
}

export function useLocation() {
  const pathname = usePathname();
  const router = useRouter();

  const location = pathname || "/";

  const navigate = React.useCallback(
    (to: string) => {
      router.push(to);
    },
    [router],
  );

  return [location, navigate] as const;
}

export function useParams<T extends Record<string, string>>() {
  return useNextParams() as T;
}
