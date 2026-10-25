import type { Metadata } from "next";
import { LOGIN } from "@/components/landing/content";
import { LoginForm } from "@/components/landing/login-form";
import { PageShell } from "@/components/landing/page-shell";
import { TeamRow } from "@/components/landing/team-row";

export const metadata: Metadata = {
  title: "Entrar",
  description: LOGIN.text,
};

export default function EntrarPage() {
  return (
    <PageShell title={LOGIN.title} text={LOGIN.text} aside={<TeamRow />}>
      <LoginForm />
    </PageShell>
  );
}
