import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";
import type { Invoice, Paginated } from "@/lib/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = request.nextUrl;

  const query = new URLSearchParams();
  query.set("customerId", id);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  if (status) query.set("status", status);
  if (search) query.set("search", search);
  query.set("page", searchParams.get("page") ?? "1");
  query.set("limit", "10");

  try {
    const data = await apiFetch<Paginated<Invoice>>(`/invoices?${query}`);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
