import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-wrap listing-page not-found">
      <div className="eyebrow">
        <span className="eyebrow-line" /> 404 / NOT FOUND
      </div>
      <h1 className="page-title">
        This page is still <span className="serif-italic">an idea.</span>
      </h1>
      <p className="section-aside">It may have been moved, unpublished, or never written.</p>
      <Link href="/" className="button-primary">
        BACK TO THE STUDIO
      </Link>
    </section>
  );
}
