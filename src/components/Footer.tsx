import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  const shopLinks = [
    { name: "New Arrivals", href: "#new-arrivals" },
    { name: "Best Sellers", href: "#best-sellers" },
    { name: "Trending Now", href: "#trending" },
    { name: "Collections", href: "#collections" },
  ];

  const supportLinks = [
    { name: "Shipping & Returns", href: "#" },
    { name: "Order Tracking", href: "#" },
    { name: "Size Guide", href: "#" },
    { name: "FAQs", href: "#" },
  ];

  const companyLinks = [
    { name: "Our Story", href: "#" },
    { name: "Sustainability", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
  ];

  return (
    <footer className="bg-charcoal text-ivory pt-24 pb-12 border-t border-stone/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 md:gap-12 mb-20">
        
        {/* Column 1: Brand Info */}
        <div className="lg:col-span-2 space-y-6">
          <Link
            href="/"
            className="font-display text-2xl md:text-3xl font-semibold tracking-[0.25em] text-ivory block"
          >
            STASH & HAUL
          </Link>
          <p className="text-stone/60 text-sm max-w-sm leading-relaxed">
            Curating luxury lifestyle, fashion, beauty, and modern essentials for everyday living. High aesthetics, accessible pricing.
          </p>
          <div className="flex space-x-5 pt-2">
            {[
              { icon: <Instagram className="w-5 h-5" strokeWidth={1.5} />, label: "Instagram" },
              { icon: <Twitter className="w-5 h-5" strokeWidth={1.5} />, label: "Twitter" },
              { icon: <Facebook className="w-5 h-5" strokeWidth={1.5} />, label: "Facebook" },
            ].map((social, index) => (
              <a
                key={index}
                href="#"
                aria-label={social.label}
                className="text-stone/60 hover:text-gold transition-colors duration-300"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Shop Links */}
        <div className="space-y-6">
          <h3 className="font-display text-base tracking-widest uppercase text-gold">Shop</h3>
          <ul className="space-y-4">
            {shopLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-stone/60 hover:text-ivory text-xs tracking-wider uppercase transition-colors duration-300"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Support Links */}
        <div className="space-y-6">
          <h3 className="font-display text-base tracking-widest uppercase text-gold">Support</h3>
          <ul className="space-y-4">
            {supportLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-stone/60 hover:text-ivory text-xs tracking-wider uppercase transition-colors duration-300"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: About Links */}
        <div className="space-y-6">
          <h3 className="font-display text-base tracking-widest uppercase text-gold">About</h3>
          <ul className="space-y-4">
            {companyLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-stone/60 hover:text-ivory text-xs tracking-wider uppercase transition-colors duration-300"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom Footer Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-stone/10 flex flex-col md:flex-row items-center justify-between text-stone/40 text-[10px] tracking-[0.2em] uppercase space-y-4 md:space-y-0">
        <div>&copy; {new Date().getFullYear()} Stash and Haul. All Rights Reserved.</div>
        <div className="flex space-x-8">
          <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
