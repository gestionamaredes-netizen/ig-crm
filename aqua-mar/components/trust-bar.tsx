import {
  BadgeCheck,
  ShieldCheck,
  HeartHandshake,
  Store,
  Boxes,
  Truck,
} from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "Productos originales" },
  { icon: BadgeCheck, label: "Distribuidor oficial" },
  { icon: HeartHandshake, label: "Atención personalizada" },
  { icon: Store, label: "Ventas minoristas" },
  { icon: Boxes, label: "Ventas mayoristas" },
  { icon: Truck, label: "Envíos a todo el país" },
];

export function TrustBar() {
  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden}
      className="flex shrink-0 items-center gap-10 pr-10"
    >
      {ITEMS.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-2.5 whitespace-nowrap"
        >
          <item.icon className="size-5 text-mar" strokeWidth={2.2} />
          <span className="text-sm font-bold text-deep/80">{item.label}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="border-y border-deep/5 bg-white py-5">
      <div className="mx-auto max-w-6xl overflow-hidden px-4 lg:px-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
