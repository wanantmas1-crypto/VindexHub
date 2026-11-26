import { Container } from "@/components/container";
import { OrderLookupForm } from "./lookup-form";

export const metadata = { title: "Order Lookup" };

export default function OrderLookupPage() {
  return (
    <main className="py-14 sm:py-16">
      <Container className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Orders</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Order Lookup</h1>
        <p className="mt-3 leading-7 text-muted">Enter your email and order ID to access your downloads and license keys.</p>
        <div className="mt-8">
          <OrderLookupForm />
        </div>
      </Container>
    </main>
  );
}
