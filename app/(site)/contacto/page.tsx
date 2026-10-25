import type { Metadata } from "next";
import { ContactForm } from "@/components/landing/contact-form";
import { CONTACT } from "@/components/landing/content";
import { PageShell } from "@/components/landing/page-shell";
import { TeamRow } from "@/components/landing/team-row";

export const metadata: Metadata = {
  title: "Contacto",
  description: CONTACT.text,
};

export default function ContactoPage() {
  return (
    <PageShell title={CONTACT.title} text={CONTACT.text} aside={<TeamRow />}>
      <ContactForm />
    </PageShell>
  );
}
