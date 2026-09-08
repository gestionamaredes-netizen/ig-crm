import {
  BadgeCheck,
  ShieldCheck,
  HeartHandshake,
  Store,
  Boxes,
  Truck,
} from "lucide-react";
import { content } from "@/data/content";

const ICONS = [BadgeCheck, ShieldCheck, HeartHandshake, Store, Boxes, Truck];

/** Marquesina de confianza con seis bloques. */
export function TrustBar() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center gap-10 pr-10">
      {content.trustBar.map((label, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <li key={label} className="flex items-center gap-2.5 whitespace-nowrap">
            <Icon className="size-5 text-turquesa" strokeWidth={2.2} />
            <span className="text-sm font-bold text-ink/80">{label}</span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section aria-label="Garantías de Aqua Mar" className="border-y border-border bg-white py-5">
      <div className="mx-auto max-w-[1320px] overflow-hidden px-5 sm:px-6 lg:px-[60px] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
