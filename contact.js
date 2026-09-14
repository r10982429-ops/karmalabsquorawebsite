module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : (req.body || {});

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const website = String(body.website || "").trim();
    const service = String(body.service || "").trim();
    const goal = String(body.goal || "").trim();
    const message = String(body.message || "").trim();
    const company = String(body.company || "").trim();

    // Hidden honeypot field for basic bot protection.
    if (company) {
      return res.status(200).json({ success: true });
    }

    if (!name || !email || !service || !goal || !message) {
      return res.status(400).json({
        error: "Please complete all required fields."
      });
    }

    const response = await fetch("https://formspree.io/f/xnpqkwag", {
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
        _subject: "New Karma Labs Quora Enquiry"
      })
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Formspree error:", details);

      return res.status(502).json({
        error: "Formspree could not accept the enquiry."
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Contact API error:", error);

    return res.status(500).json({
      error: "Unable to send enquiry right now."
    });
  }
};
