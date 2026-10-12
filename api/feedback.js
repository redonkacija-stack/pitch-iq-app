const MAX_LENGTH = 1000;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const message = typeof request.body?.message === "string" ? request.body.message.trim() : "";
  if (!message || message.length > MAX_LENGTH) {
    return response.status(400).json({ error: "Feedback must be between 1 and 1000 characters." });
  }

  const apiKey = process.env.RESEND_API_KEY || process.env.PitchIQ_Feedback;
  if (!apiKey) {
    return response.status(503).json({ error: "Feedback delivery is not configured." });
  }

  try {
    const delivery = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PitchIQ Feedback <onboarding@resend.dev>",
        to: ["redonkacija@gmail.com"],
        subject: "New PitchIQ website feedback",
        text: message,
      }),
    });

    if (!delivery.ok) {
      console.error("Feedback email delivery failed", delivery.status);
      return response.status(502).json({ error: "Feedback delivery failed." });
    }
    return response.status(200).json({ sent: true });
  } catch (error) {
    console.error("Feedback email request failed", error);
    return response.status(502).json({ error: "Feedback delivery failed." });
  }
}
