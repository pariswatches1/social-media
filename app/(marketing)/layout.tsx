"use client";

import { useEffect } from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.documentElement.classList.add("marketing-page");
    return () => {
      document.documentElement.classList.remove("marketing-page");
    };
  }, []);

  return (
    <>
      <div id="grain" />
      <div id="spl" />
      <div id="cd" />
      <div id="cr" />
      {children}
    </>
  );
}
