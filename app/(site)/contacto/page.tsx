import { Link } from "next-view-transitions";

// Página temporal de la base: el Constructor 1 la reemplaza.
export default function Contacto() {
  return (
    <section className="page-w min-h-[100dvh] pt-40">
      <h1 className="t-hero">Contacto</h1>
      <p className="t-lead mt-6">Página de prueba.</p>
      <Link href="/" className="mt-6 inline-block text-link underline">Volver</Link>
    </section>
  );
}
