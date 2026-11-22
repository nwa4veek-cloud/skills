import { NextResponse } from "next/server";
import { recommendProducts } from "@/lib/recommendations";
import { validateQuizAnswers } from "@/lib/quiz";
import { getAppSettings } from "@/lib/server/settings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestKey, isRateLimited } from "@/lib/server/rate-limit";
import { isSameOrigin } from "@/lib/server/origin-guard";
import type { Product } from "@/lib/types";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }
  if (isRateLimited(getRequestKey(request), 10)) {
    return NextResponse.json(
      { error: "Too many quiz attempts. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) {
    return NextResponse.json({ error: "The quiz submission is too large." }, { status: 413 });
  }

  try {
    const body = await request.json();
    const settings = await getAppSettings();
    const validation = validateQuizAnswers(body, settings.budgetRanges);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors[0], details: validation.errors }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: products, error: catalogueError } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .eq("available", true)
      .order("price", { ascending: true })
      .limit(500);
    if (catalogueError) throw catalogueError;

    const recommendations = recommendProducts(
      validation.answers,
      (products ?? []) as Product[],
      settings.recommendation,
    );
    const { data: submission, error: submissionError } = await supabase
      .from("quiz_submissions")
      .insert({
        budget: validation.answers.budget,
        budget_label: validation.answers.budgetLabel,
        priorities: validation.answers.priorities,
        usage: validation.answers.usage,
        condition_preference: validation.answers.condition,
        flexibility: validation.answers.flexibility,
      })
      .select("id")
      .single();
    if (submissionError || !submission) throw submissionError ?? new Error("Submission was not saved.");

    if (recommendations.length > 0) {
      const { error: recommendationError } = await supabase.from("recommendations").insert(
        recommendations.map((recommendation) => ({
          submission_id: submission.id,
          product_id: recommendation.product.id,
          score: recommendation.score,
          classification: recommendation.classification,
          explanation: recommendation.explanation,
        })),
      );
      if (recommendationError) {
        await supabase.from("quiz_submissions").delete().eq("id", submission.id);
        throw recommendationError;
      }
    }

    const { error: eventError } = await supabase.from("analytics_events").insert({
      event_name: "quiz_submitted",
      submission_id: submission.id,
    });
    if (eventError) console.error("Quiz submission analytics could not be recorded.", eventError);

    const publicRecommendations = recommendations.map(({ product, ...recommendation }) => ({
      ...recommendation,
      product: {
        id: product.id,
        brand: product.brand,
        model: product.model,
        name: product.name,
        price: product.price,
        condition: product.condition,
        ram: product.ram,
        storage: product.storage,
        processor: product.processor,
        display: product.display,
        camera: product.camera,
        battery: product.battery,
        battery_health: product.battery_health,
        physical_condition: product.physical_condition,
        warranty: product.warranty,
        image_path: product.image_path,
        description: product.description,
      },
    }));

    return NextResponse.json({
      submissionId: submission.id,
      answers: validation.answers,
      recommendations: publicRecommendations,
    });
  } catch (error) {
    console.error("Could not complete the recommendation request.", error);
    return NextResponse.json(
      { error: "We could not load your matches just now. Please try again in a moment." },
      { status: 503 },
    );
  }
}
