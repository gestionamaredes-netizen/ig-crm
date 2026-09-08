"use client";

import Image from "next/image";
import { products } from "@/data/products";
import { STOCK_LABELS } from "@/commerce/types";
import { useDashboardData } from "@/dashboard/service";
import { StatusBadge } from "@/components/dashboard/widgets";

export default function ProductosPage() {
  const { data } = useDashboardData();
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">Productos</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((p) => {
          const stats = data.productos.find((x) => x.productId === p.id);
          return (
            <article
              key={p.id}
              className="flex gap-4 rounded-3xl border border-border bg-white p-5 shadow-xs dark:border-white/10 dark:bg-white/5"
            >
              <div className="relative size-24 flex-none overflow-hidden rounded-2xl">
                <Image
                  src={p.image}
                  alt={`${p.name} ${p.presentation}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                  style={{ objectPosition: p.imagePosition }}
                />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                  {p.name} · {p.presentation}
                </h2>
                <p className="mt-1 text-xs text-ink-soft dark:text-white/50">{p.shortDescription}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <StatusBadge label={p.active ? "Activo" : "Inactivo"} tone={p.active ? "green" : "gray"} />
                  <StatusBadge label={STOCK_LABELS[p.stockStatus]} tone="blue" />
                  <StatusBadge
                    label={
                      stats?.consultas == null ? "Consultas: —" : `Consultas: ${stats.consultas}`
                    }
                    tone="gray"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="text-xs text-ink-soft dark:text-white/40">
        Los productos se editan en <code>src/data/products.ts</code>. El stock
        no se muestra hasta que exista un dato confirmado.
      </p>
    </>
  );
}
