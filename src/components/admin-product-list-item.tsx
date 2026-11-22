"use client";

import Link from "next/link";
import { memo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";

export const AdminProductListItem = memo(function AdminProductListItem({ product }: { product: Product }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const removeProduct = useCallback(async () => {
    if (!window.confirm(`Permanently delete ${product.name}? This cannot be undone. Deactivate it instead to keep recommendation history.`)) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Product could not be deleted.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Product could not be deleted.");
    } finally {
      setBusy(false);
    }
  }, [product.id, product.name, router]);

  return (
    <li className="flex flex-col gap-4 border-t border-[var(--line)] py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-semibold">{product.name}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">₦{product.price.toLocaleString("en-NG")} · {product.condition === "NEW" ? "Brand-new" : "London-used"} · {product.available ? "Available" : "Unavailable"} · {product.active ? "Active" : "Inactive"}</p>
        {error ? <p className="mt-2 text-sm text-red-700" role="alert">{error}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <Link className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold hover:border-[var(--leaf)]" href={`/admin/products/${product.id}/edit`}>Edit</Link>
        <button className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-50" disabled={busy} onClick={removeProduct} type="button">{busy ? "Deleting…" : "Delete"}</button>
      </div>
    </li>
  );
});
