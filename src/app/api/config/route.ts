import { NextResponse } from "next/server";
import { getAppSettings } from "@/lib/server/settings";

export async function GET() {
  const settings = await getAppSettings();
  return NextResponse.json(
    {
      budgetRanges: settings.budgetRanges,
      whatsappNumber: settings.whatsappNumber,
      whatsappConfigured: /^\d{8,15}$/.test(settings.whatsappNumber),
      flexibilityPercentages: settings.recommendation.flexibilityPercentages,
    },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
