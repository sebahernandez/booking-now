"use client";

import { useEffect, useState } from "react";

interface ClientDateProps {
  date: Date | string;
  format?: "date" | "datetime" | "time";
  locale?: string;
  className?: string;
}

export function ClientDate({
  date,
  format = "date",
  locale = "es-ES",
  className,
}: ClientDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      let options: Intl.DateTimeFormatOptions = {};

      switch (format) {
        case "date":
          options = {
            year: "numeric",
            month: "short",
            day: "numeric",
          };
          break;
        case "datetime":
          options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          };
          break;
        case "time":
          options = {
            hour: "2-digit",
            minute: "2-digit",
          };
          break;
      }

      setFormattedDate(dateObj.toLocaleDateString(locale, options));
    } catch {
      setFormattedDate("Fecha inválida");
    }
  }, [date, format, locale]);

  if (!isMounted) {
    return <span className={className}>Cargando...</span>;
  }

  return <span className={className}>{formattedDate}</span>;
}
