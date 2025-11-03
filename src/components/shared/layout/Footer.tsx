import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-white/10 border-t h-16">
      <div className="flex sm:flex-row flex-col justify-between items-center gap-4 mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl h-[inherit] text-text-primary/70 text-sm">
        <p>
          © {new Date().getFullYear()} THAIKICK MUAYTHAI. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-text-primary">
            About us
          </Link>
          <Link href="/privacy" className="hover:text-text-primary">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text-primary">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
