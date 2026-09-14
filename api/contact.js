export function GET() {
  return Response.json({
    success: true,
    message: "Karma Labs contact API is working"
  });
}

export async function POST(request) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

    if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
      console.error("Supabase environment variables missing");

      return Response.json(
        { error: "Database is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const website = String(body.website || "").trim();
    const service = String(body.service || "").trim();
    const goal = String(body.goal || "").trim();
    const message = String(body.message || "").trim();
    const company = String(body.company || "").trim();

    // Spam protection
    if (company) {
      return Response.json({ success: true });
    }

    if (!name || !email || !service || !goal || !message) {
      return Response.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const lead = {
      name,
      email,
      website: website || null,
      industry: service,
      main_goal: goal,
      message,
      status: "new",
      source: "website"
    };

    const supabaseResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/leads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_SECRET_KEY,
          "Prefer": "return=representation"
        },
        body: JSON.stringify(lead)
      }
    );

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();

      console.error("Supabase error:", errorText);

      return Response.json(
        { error: "Unable to save enquiry." },
        { status: 500 }
      );
    }

    const savedLead = await supabaseResponse.json();

    return Response.json({
      success: true,
      leadId: savedLead?.[0]?.id || null
    });

  } catch (error) {
    console.error("Contact API error:", error);

    return Response.json(
      { error: "Unable to send enquiry." },
      { status: 500 }
    );
  }
}
