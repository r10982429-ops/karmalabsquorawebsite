module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    console.error("Missing Supabase environment variables.");
    return res.status(500).json({
      error: "Database connection is not configured."
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : (req.body || {});

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const website = String(body.website || "").trim();
    const service = String(body.service || "").trim();
    const goal = String(body.goal || "").trim();
    const message = String(body.message || "").trim();
    const company = String(body.company || "").trim();

    // Honeypot: silently accept obvious bot submissions.
    if (company) {
      return res.status(200).json({ success: true });
    }

    if (!name || !email || !service || !goal || !message) {
      return res.status(400).json({
        error: "Please complete all required fields."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address."
      });
    }

    const lead = {
      name,
      email,
      website: website || null,

      // These map to the existing Supabase leads table:
      industry: service,
      main_goal: goal,

      message,
      status: "new",
      source: "website"
    };

    // 1) Save lead to Supabase.
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
      const details = await supabaseResponse.text();
      console.error("Supabase insert error:", details);

      return res.status(502).json({
        error: "We could not save your enquiry. Please try again."
      });
    }

    const savedRows = await supabaseResponse.json();
    const leadId = savedRows?.[0]?.id || null;

    // 2) Formspree notification (secondary).
    // If Formspree fails, the lead is still safely stored in Supabase.
    try {
      const formspreeResponse = await fetch(
        "https://formspree.io/f/xnpqkwag",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            website,
            service,
            goal,
            message,
            lead_id: leadId,
            _subject: "New Karma Labs Quora Enquiry"
          })
        }
      );

      if (!formspreeResponse.ok) {
        console.error(
          "Formspree notification failed:",
          await formspreeResponse.text()
        );
      }
    } catch (notificationError) {
      console.error(
        "Formspree notification error:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,
      leadId
    });

  } catch (error) {
    console.error("Contact API error:", error);

    return res.status(500).json({
      error: "Unable to send enquiry right now."
    });
  }
};
