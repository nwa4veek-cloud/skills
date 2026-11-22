import {
  PRIORITIES,
  USAGES,
  type MatchingAttributes,
  type Product,
  type ProductCondition,
  type UsageSuitability,
} from "@/lib/types";

const SUITABILITY = ["exact", "related", "general", "none"];

function text(value: unknown, maximum: number, optional = false): string | null {
  if (optional && (value === null || value === undefined || value === "")) return null;
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maximum) return null;
  return value.trim();
}

export function validateProductInput(input: unknown): Partial<Product> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  const brand = text(value.brand, 80);
  const model = text(value.model, 120);
  const name = text(value.name, 160);
  const description = text(value.description, 2000);
  const condition = value.condition;
  const price = value.price;

  if (
    !brand ||
    !model ||
    !name ||
    !description ||
    !Number.isSafeInteger(price) ||
    Number(price) <= 0 ||
    !["NEW", "LONDON_USED"].includes(String(condition))
  ) {
    return null;
  }

  const attributes = value.matching_attributes as Record<string, unknown> | undefined;
  if (
    !attributes ||
    !PRIORITIES.every((key) => Number.isInteger(attributes[key]) && Number(attributes[key]) >= 1 && Number(attributes[key]) <= 5)
  ) {
    return null;
  }

  const suitability = value.usage_suitability as Record<string, unknown> | undefined;
  if (!suitability || !USAGES.every((key) => SUITABILITY.includes(String(suitability[key])))) {
    return null;
  }

  const imagePath = text(value.image_path, 200, true);
  if (imagePath && (imagePath.includes("..") || imagePath.startsWith("/"))) return null;

  const batteryHealth = value.battery_health;
  if (
    batteryHealth !== null &&
    batteryHealth !== undefined &&
    (!Number.isInteger(batteryHealth) || Number(batteryHealth) < 1 || Number(batteryHealth) > 100)
  ) {
    return null;
  }

  for (const flag of ["active", "available"]) {
    if (typeof value[flag] !== "boolean") return null;
  }

  return {
    brand,
    model,
    name,
    price: Number(price),
    condition: condition as ProductCondition,
    ram: text(value.ram, 40, true),
    storage: text(value.storage, 40, true),
    processor: text(value.processor, 100, true),
    display: text(value.display, 160, true),
    camera: text(value.camera, 160, true),
    battery: text(value.battery, 120, true),
    battery_health: batteryHealth === null || batteryHealth === undefined ? null : Number(batteryHealth),
    physical_condition: text(value.physical_condition, 500, true),
    warranty: text(value.warranty, 500, true),
    image_path: imagePath,
    active: typeof value.active === "boolean" ? value.active : false,
    available: typeof value.available === "boolean" ? value.available : false,
    description,
    matching_attributes: attributes as MatchingAttributes,
    usage_suitability: suitability as UsageSuitability,
  };
}
