import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_APP_SETTINGS,
  isValidSettings,
  type AppSettings,
} from "@/lib/settings";
import { DEFAULT_RECOMMENDATION_CONFIG } from "@/lib/recommendations";

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const supabase = createSupabaseAdminClient();
    const keys = ["whatsapp_number", "budget_ranges", "recommendation_config"];
    const results = await Promise.allSettled(
      keys.map((key) => supabase.from("app_settings").select("value").eq("key", key).maybeSingle()),
    );
    const values = results.map((result) =>
      result.status === "fulfilled" && !result.value.error ? result.value.data?.value : undefined,
    );
    const settings = {
      whatsappNumber:
        typeof values[0] === "string" && values[0].length > 0
          ? values[0]
          : DEFAULT_APP_SETTINGS.whatsappNumber,
      budgetRanges: Array.isArray(values[1]) ? values[1] : DEFAULT_APP_SETTINGS.budgetRanges,
      recommendation: values[2]
        ? { ...DEFAULT_RECOMMENDATION_CONFIG, ...(values[2] as object) }
        : DEFAULT_APP_SETTINGS.recommendation,
    };
    return isValidSettings(settings) ? settings : DEFAULT_APP_SETTINGS;
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}
