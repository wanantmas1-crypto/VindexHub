import { LoginForm } from "./login-form";

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : "/admin";
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
        <p className="mt-2 text-sm text-muted">Sign in to manage products, services, reviews, and requests.</p>
        <div className="mt-6">
          <LoginForm nextPath={nextPath} />
        </div>
      </div>
    </main>
  );
}
