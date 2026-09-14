module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed."
    });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    return res.status(500).json({
      error: "Supabase is not configured."
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const website = String(body.website || "").trim();
    const service = String(body.service || "").trim();
    const goal = String(body.goal || "").trim();
    const message = String(body.message || "").trim();
    const company = String(body.company || "").trim();

    // Spam protection
    if (company) {
      return res.status(200).json({
        success: true
      });
    }

    if (!name || !email || !service || !goal || !message) {
      return res.status(400).json({
        error: "Please complete all required fields."
      });
    }

    const lead = {
      name: name,
      email: email,
      website: website || null,

      // Quora Service
      industry: service,

      // Primary Goal
      main_goal: goal,

      message: message,

      status: "new",
      source: "website"
    };

    const response = await fetch(
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

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Supabase error:",
        errorText
      );

      return res.status(500).json({
        error: "Unable to save enquiry."
      });
    }

    const savedLead = await response.json();

    return res.status(200).json({
      success: true,
      lead: savedLead
    });

  } catch (error) {

    console.error(
      "Contact API error:",
      error
    );

    return res.status(500).json({
      error: "Unable to send enquiry."
    });
  }
};
