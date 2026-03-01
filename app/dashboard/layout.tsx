// app/dashboard/layout.tsx
import { Container } from "@/components/ui/Container";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Container className="py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="mt-6">{children}</div>
      </Container>
    </main>
  );
}