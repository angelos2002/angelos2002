import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x grid min-h-[70vh] place-items-center pt-24 text-center">
      <div>
        <p className="kicker">404</p>
        <h1 className="heading mt-3 text-6xl">Lost the bun.</h1>
        <p className="mt-4 text-cream-muted">This page doesn&apos;t exist. / Η σελίδα δεν υπάρχει.</p>
        <Link href="/" className="btn-primary mt-8">Home</Link>
      </div>
    </section>
  );
}
