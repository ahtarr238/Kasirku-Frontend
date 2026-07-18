// Auth dijaga oleh middleware.ts (server-side, via cookie).
// Layout ini cukup render children saja.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
