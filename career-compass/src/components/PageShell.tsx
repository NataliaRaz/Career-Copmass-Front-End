import Container from "./Container";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-gray-50 py-6">
      <Container>{children}</Container>
    </main>
  );
}
