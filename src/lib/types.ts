export const CONDITIONS = ["NEW", "LONDON_USED"] as const;
export type ProductCondition = (typeof CONDITIONS)[number];

export const PRIORITIES = [
  "camera",
  "battery",
  "performance",
  "storage",
  "display",
  "durability",
  "value",
] as const;
export type Priority = (typeof PRIORITIES)[number];

export const USAGES = [
  "social",
  "photography",
  "gaming",
  "business",
  "content",
  "general",
] as const;
export type Usage = (typeof USAGES)[number];

export type BudgetRange = {
  label: string;
  min: number;
  max: number | null;
};

export type QuizAnswers = {
  budget: number;
  budgetLabel: string;
  priorities: [Priority, Priority];
  usage: Usage;
  condition: "NEW_ONLY" | "LONDON_USED_ONLY" | "BOTH";
  flexibility: "STRICT" | "SLIGHT" | "FLEXIBLE";
};

export type MatchingAttributes = Record<Priority, number>;
export type UsageSuitability = Record<Usage, "exact" | "related" | "general" | "none">;

export type Product = {
  id: string;
  brand: string;
  model: string;
  name: string;
  price: number;
  condition: ProductCondition;
  ram: string | null;
  storage: string | null;
  processor: string | null;
  display: string | null;
  camera: string | null;
  battery: string | null;
  battery_health: number | null;
  physical_condition: string | null;
  warranty: string | null;
  image_path: string | null;
  available: boolean;
  active: boolean;
  description: string;
  matching_attributes: MatchingAttributes;
  usage_suitability: UsageSuitability;
  created_at: string;
  updated_at: string;
};

export type Recommendation = {
  product: Product;
  score: number;
  classification: "Excellent Match" | "Good Match" | "Fair Match" | "Weak Match";
  explanation: string;
  advantages: string[];
  tradeOffs: string[];
  checklist: string[] | null;
};

export type PublicProduct = Pick<
  Product,
  | "id"
  | "brand"
  | "model"
  | "name"
  | "price"
  | "condition"
  | "ram"
  | "storage"
  | "processor"
  | "display"
  | "camera"
  | "battery"
  | "battery_health"
  | "physical_condition"
  | "warranty"
  | "image_path"
  | "description"
>;

export type PublicRecommendation = Omit<Recommendation, "product"> & {
  product: PublicProduct;
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  camera: "Camera quality",
  battery: "Battery life",
  performance: "Gaming and performance",
  storage: "Storage capacity",
  display: "Display quality",
  durability: "Durability and reliability",
  value: "Overall value for money",
};

export const USAGE_LABELS: Record<Usage, string> = {
  social: "Social media and everyday communication",
  photography: "Photography and video recording",
  gaming: "Gaming",
  business: "Business and productivity",
  content: "Content creation",
  general: "General everyday use",
};

export const USED_PHONE_CHECKLIST = [
  "Check battery health and ask about battery performance.",
  "Inspect the screen in bright light for cracks, spots or discolouration.",
  "Test touch functionality across the full screen.",
  "Test every camera and record a short video.",
  "Check the charging port and confirm the phone charges reliably.",
  "Test speakers, microphone and earpiece during a call.",
  "Confirm network connectivity with a SIM card.",
  "Test Face ID or fingerprint functionality, where applicable.",
  "Verify the IMEI and device status with the seller.",
  "Inspect the body for dents, cracks and signs of liquid damage.",
  "Confirm warranty coverage and return arrangements with the seller.",
];
