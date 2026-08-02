"use client";

import { useState } from "react";
import Image from "next/image";
import { products } from "@/data/products";
import { commerceConfig } from "@/config/commerce";
import { content } from "@/data/content";
import { STOCK_LABELS, type Product } from "@/commerce/types";
import { buildOrderMessage } from "@/commerce/messages";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/analytics/track-event";
import { Container, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/ui/icons";

/** Catálogo con selector de cantidad y pedido por WhatsApp. */
export function ProductCatalog() {
  const active = products.filter((p) => p.active);

  if (active.length === 0) {
    return (
      <section className="bg-white pb-16 sm:pb-24 lg:pb-32">
        <Container>
          <p className="mx-auto max-w-md rounded-3xl border border-border bg-mist p-8 text-center text-ink-soft">
            En este momento estamos actualizando el catálogo. Contactanos para
            recibir información.
          </p>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-white pb-16 sm:pb-24 lg:pb-32" aria-label="Catálogo de productos">
      <Container>
        <Reveal>
          <SectionTitle kicker={content.presentations.kicker} title={content.presentations.title} />
        </Reveal>
        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
          {active.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.1}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function StockBadge({ product }: { product: Product }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-xs font-bold text-ink-soft">
      <span className="size-1.5 rounded-full bg-turquesa" />
      {STOCK_LABELS[product.stockStatus]}
    </span>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(commerceConfig.quantityOptions.retail[0]);
  const unavailable = product.stockStatus === "sin_stock";

  const priceLabel =
    commerceConfig.showPrices && product.price?.retail
      ? `$${product.price.retail.toLocaleString("es-AR")}`
      : "Consultar precio";

  function order(customerType: "retail" | "wholesale") {
    const message = buildOrderMessage({
      customerType,
      productName: product.name,
      presentation: product.presentation,
      quantity: customerType === "retail" ? `${quantity} ${quantity === "1" ? "unidad" : "unidades"}` : undefined,
    });
    const url = getWhatsAppUrl(message);
    trackEvent({
      name: "order_whatsapp_click",
      category: "commerce",
      params: {
        product_id: product.id,
        presentation: product.presentation,
        quantity,
        customer_type: customerType,
        source_section: "catalog",
      },
    });
    if (url) window.open(url, "_blank");
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative aspect-[5/4] overflow-hidden">
        <Image
          src={product.image}
          alt={`Envase original de ${product.name}, presentación de ${product.presentation}`}
          fill
          sizes="(max-width: 640px) 100vw, 40vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ objectPosition: product.imagePosition }}
        />
        <span className="glass absolute left-4 top-4 rounded-full px-4 py-1.5 font-display text-sm font-extrabold text-navy">
          {product.presentation}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-extrabold text-ink">
            {product.name} · {product.presentation}
          </h3>
        </div>
        <p className="mt-1.5 text-[15px] text-ink-soft">{product.shortDescription}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StockBadge product={product} />
          <span className="inline-flex items-center rounded-full bg-celeste/60 px-3 py-1 text-xs font-bold text-primary">
            {priceLabel}
          </span>
        </div>

        {unavailable ? (
          <p className="mt-5 rounded-2xl bg-mist p-4 text-sm text-ink-soft">
            Esta presentación no se encuentra disponible temporalmente.
            Consultanos por otras opciones.
          </p>
        ) : (
          <>
            {commerceConfig.enableRetailOrders && product.retailAvailable && (
              <label className="mt-5 grid gap-1.5 text-sm font-bold text-ink">
                Cantidad
                <select
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    trackEvent({
                      name: "quantity_select",
                      category: "commerce",
                      params: { product_id: product.id, quantity: e.target.value },
                    });
                  }}
                  className="h-14 w-full rounded-2xl border border-border bg-white px-4 text-[15px] font-medium text-ink outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgb(0_88_217/0.12)]"
                >
                  {commerceConfig.quantityOptions.retail.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="mt-5 grid flex-1 content-end gap-2.5">
              {commerceConfig.enableRetailOrders && product.retailAvailable && (
                <button
                  onClick={() => order("retail")}
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-[18px] bg-primary px-6 text-[15px] font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:bg-primary-hover active:bg-primary-active"
                >
                  <WhatsAppIcon className="size-5" />
                  Pedir por WhatsApp
                </button>
              )}
              {commerceConfig.enableWholesaleOrders && product.wholesaleAvailable && (
                <button
                  onClick={() => order("wholesale")}
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[18px] border-2 border-primary/25 bg-white px-6 text-sm font-bold text-primary transition-all hover:border-primary hover:bg-celeste/40"
                >
                  Consultar por mayor
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
