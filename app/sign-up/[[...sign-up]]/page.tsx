import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center justify-center px-4 py-10">
      <SignUp
        fallbackRedirectUrl="/templates"
        signInFallbackRedirectUrl="/templates"
      />
    </main>
  );
}