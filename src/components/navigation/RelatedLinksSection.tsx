import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import type { RelatedLink } from "@/lib/internal-links";

export default function RelatedLinksSection({
  title,
  links,
}: {
  title: string;
  links: RelatedLink[];
}) {
  if (!links.length) return null;

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between gap-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block h-full">
            <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{link.title}</h3>
                  {link.description ? (
                    <p className="text-sm text-gray-600 leading-relaxed">{link.description}</p>
                  ) : null}
                </div>
                <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

