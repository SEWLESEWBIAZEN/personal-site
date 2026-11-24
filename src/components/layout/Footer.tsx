import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function Footer({ location }: { location?: string | null }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <Link className="brand" href="/">
          <Logo className="brand-mark" />
          <span className="brand-name">
            SEWLESEW BIAZEN<span className="brand-period">.</span>
          </span>
        </Link>
        <span className="footer-manifesto">BUILD THOUGHTFULLY. STAY CURIOUS.</span>
        <a href="#home" className="back-top">
          BACK TO TOP <ArrowUpRight size={13} />
        </a>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} SEWLESEW BIAZEN. ALL RIGHTS RESERVED.</span>
        <span>DESIGNED AS A DIGITAL NOTEBOOK.</span>
        {location && <span>{location.toUpperCase()} &#8599;</span>}
      </div>
    </footer>
  );
}
