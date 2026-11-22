"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  USAGES,
  USAGE_LABELS,
  type MatchingAttributes,
  type Product,
  type ProductCondition,
  type Usage,
  type UsageSuitability,
} from "@/lib/types";
import { ProductRatingField, ProductSuitabilityField } from "@/components/product-attribute-field";
import { ProductTextField, type TextProductKey } from "@/components/product-text-field";
import { optimizeProductImage } from "@/lib/image-optimization";

type ProductDraft = Omit<Product, "id" | "created_at" | "updated_at">;

const INITIAL_DRAFT: ProductDraft = {
  brand: "",
  model: "",
  name: "",
  price: 0,
  condition: "NEW",
  ram: "",
  storage: "",
  processor: "",
  display: "",
  camera: "",
  battery: "",
  battery_health: null,
  physical_condition: "",
  warranty: "",
  image_path: null,
  available: true,
  active: true,
  description: "",
  matching_attributes: {
    camera: 3,
    battery: 3,
    performance: 3,
    storage: 3,
    display: 3,
    durability: 3,
    value: 3,
  },
  usage_suitability: {
    social: "general",
    photography: "none",
    gaming: "none",
    business: "none",
    content: "none",
    general: "general",
  },
};

const TEXT_FIELDS: { key: TextProductKey; label: string; required?: boolean }[] = [
  { key: "brand", label: "Brand", required: true },
  { key: "model", label: "Model", required: true },
  { key: "name", label: "Product name", required: true },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "processor", label: "Processor" },
  { key: "display", label: "Display information" },
  { key: "camera", label: "Camera information" },
  { key: "battery", label: "Battery information" },
  { key: "physical_condition", label: "Physical condition" },
  { key: "warranty", label: "Warranty information" },
];

type ProductFormProps = { product?: Product };

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<ProductDraft>(product ?? INITIAL_DRAFT);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const title = useMemo(() => (product ? "Edit product" : "Add a product"), [product]);

  const updateText = useCallback((key: TextProductKey, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const updateRating = useCallback((key: keyof MatchingAttributes, value: number) => {
    setDraft((current) => ({
      ...current,
      matching_attributes: { ...current.matching_attributes, [key]: value },
    }));
  }, []);

  const updateSuitability = useCallback((key: Usage, value: UsageSuitability[Usage]) => {
    setDraft((current) => ({
      ...current,
      usage_suitability: { ...current.usage_suitability, [key]: value },
    }));
  }, []);

  const uploadImage = useCallback(async (file: File | undefined) => {
    setError("");
    setNotice("");
    if (!file) return;
    setUploading(true);
    try {
      const optimizedFile = await optimizeProductImage(file);
      const formData = new FormData();
      formData.set("file", optimizedFile);
      const response = await fetch("/api/admin/product-images", { method: "POST", body: formData });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Image could not be uploaded.");
      setDraft((current) => ({ ...current, image_path: body.imagePath }));
      setNotice("Product image uploaded. Save the product to attach it to the catalogue.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }, []);

  const saveProduct = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...draft,
        price: Number(draft.price),
        battery_health: draft.battery_health === null ? null : Number(draft.battery_health),
      };
      const response = await fetch("/api/admin/products", {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product ? { id: product.id, product: payload } : payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Product could not be saved.");
      router.push("/admin");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Product could not be saved.");
    } finally {
      setBusy(false);
    }
  }, [draft, product, router]);

  return (
    <form className="space-y-8" onSubmit={saveProduct}>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">Catalogue</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 leading-6 text-[var(--muted)]">Only verified catalogue details and vendor-configured suitability are used to explain matches. Add only facts you can confirm.</p>
      </div>

      <fieldset className="grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-5 sm:grid-cols-2 sm:p-7">
        <legend className="px-2 font-semibold">Product details</legend>
        {TEXT_FIELDS.map((field) => (
          <ProductTextField
            field={field.key}
            key={field.key}
            label={field.label}
            maxLength={field.key === "name" ? 160 : 500}
            onChange={updateText}
            required={field.required}
            value={String(draft[field.key] ?? "")}
          />
        ))}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Price (₦) *</span>
          <input className="min-h-11 w-full rounded-xl border border-[var(--line)] px-3" min={1} onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))} required type="number" value={draft.price || ""} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Condition *</span>
          <select className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3" onChange={(event) => setDraft((current) => ({ ...current, condition: event.target.value as ProductCondition }))} value={draft.condition}>
            <option value="NEW">Brand-new</option>
            <option value="LONDON_USED">London-used</option>
          </select>
        </label>
        {draft.condition === "LONDON_USED" ? (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Battery health (%)</span>
            <input className="min-h-11 w-full rounded-xl border border-[var(--line)] px-3" max={100} min={1} onChange={(event) => setDraft((current) => ({ ...current, battery_health: event.target.value ? Number(event.target.value) : null }))} type="number" value={draft.battery_health ?? ""} />
          </label>
        ) : null}
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Product description *</span>
          <textarea className="min-h-28 w-full rounded-xl border border-[var(--line)] p-3" maxLength={2000} onChange={(event) => updateText("description", event.target.value)} required value={draft.description} />
          <span className="mt-1 block text-xs text-[var(--muted)]">Use confirmed details; do not claim independent testing or inspection that did not happen.</span>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Product image</span>
          <input accept="image/jpeg,image/png,image/webp" className="block min-h-11 w-full rounded-xl border border-[var(--line)] bg-white p-2 text-sm" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0])} type="file" />
          <span className="mt-1 block text-xs text-[var(--muted)]">JPG, PNG or WebP up to 10 MB; images are resized and compressed to WebP before a maximum 3 MB upload. A stable public path is saved for caching.</span>
          {draft.image_path ? <span className="mt-2 block text-sm text-[var(--leaf)]">Image uploaded: {draft.image_path}</span> : null}
        </label>
      </fieldset>

      <fieldset className="rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-7">
        <legend className="px-2 font-semibold">Internal match attributes</legend>
        <p className="text-sm leading-6 text-[var(--muted)]">Rate the product from 1 to 5 based on information the vendor can support. These are internal matching inputs, not public industry ratings.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRIORITIES.map((priority) => (
            <ProductRatingField
              attribute={priority}
              key={priority}
              label={PRIORITY_LABELS[priority]}
              onChange={updateRating}
              value={draft.matching_attributes[priority]}
            />
          ))}
        </div>
        <h2 className="mt-8 font-semibold">Usage suitability</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Set an honest fit for each intended use.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USAGES.map((usage) => (
            <ProductSuitabilityField
              key={usage}
              label={USAGE_LABELS[usage]}
              onChange={updateSuitability}
              usage={usage}
              value={draft.usage_suitability[usage]}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-5 sm:grid-cols-2 sm:p-7">
        <legend className="px-2 font-semibold">Inventory status</legend>
        <label className="flex items-start gap-3">
          <input checked={draft.available} className="mt-1 size-4 accent-[#17684d]" onChange={(event) => setDraft((current) => ({ ...current, available: event.target.checked }))} type="checkbox" />
          <span><span className="block font-medium">Available for customers</span><span className="mt-1 block text-sm text-[var(--muted)]">Turn off if the device has sold or cannot be purchased.</span></span>
        </label>
        <label className="flex items-start gap-3">
          <input checked={draft.active} className="mt-1 size-4 accent-[#17684d]" onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} type="checkbox" />
          <span><span className="block font-medium">Active in the catalogue</span><span className="mt-1 block text-sm text-[var(--muted)]">Inactive products are hidden from recommendations but retained in history.</span></span>
        </label>
      </fieldset>

      {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p> : null}
      {notice ? <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900" role="status">{notice}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button className="min-h-12 rounded-full border border-[var(--line)] px-6 font-semibold hover:border-[var(--leaf)]" onClick={() => router.push("/admin")} type="button">Cancel</button>
        <button className="min-h-12 rounded-full bg-[var(--leaf)] px-7 font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-70" disabled={busy || uploading} type="submit">{busy ? "Saving…" : uploading ? "Uploading image…" : "Save product"}</button>
      </div>
    </form>
  );
}
