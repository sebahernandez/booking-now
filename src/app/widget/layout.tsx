import "../globals.css";
import { WidgetLayoutClient } from "./widget-layout-client";

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WidgetLayoutClient>
      {children}
    </WidgetLayoutClient>
  );
}
