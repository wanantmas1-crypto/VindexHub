import { NextResponse } from "next/server";
import { isMpesaConfigured, getMpesaEnv } from "@/lib/mpesa";

export async function GET() {
  return NextResponse.json({
    configured: isMpesaConfigured(),
    env: getMpesaEnv(),
    hasCallback: !!process.env.MPESA_CALLBACK_URL,
    hasShortcode: !!process.env.MPESA_SHORTCODE,
    hasPasskey: !!process.env.MPESA_PASSKEY,
    hasKey: !!process.env.MPESA_CONSUMER_KEY,
    hasSecret: !!process.env.MPESA_CONSUMER_SECRET,
  });
}
