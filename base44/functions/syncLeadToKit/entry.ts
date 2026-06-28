import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const lead = body.data || body;

    const { full_name, email, phone, source, quiz_section, quiz_recommendation, quiz_answers, lifecycle_stage, purchase_plan } = lead;

    if (!email) {
      console.log("No email found, skipping Kit sync.");
      return Response.json({ skipped: true, reason: "no email" });
    }

    const kitKey = Deno.env.get("KIT_API_KEY");
    if (!kitKey) {
      console.error("KIT_API_KEY is not set");
      return Response.json({ error: "Missing Kit API key" }, { status: 500 });
    }

    const nameParts = (full_name || "").trim().split(" ");
    const firstName = nameParts[0] || full_name || "";

    const fields = {
      last_name: nameParts.slice(1).join(" ") || "",
      phone: phone || "",
      source: source || "quiz",
      lifecycle_stage: lifecycle_stage || "lead",
    };
    if (quiz_section) fields.quiz_section = quiz_section;
    if (quiz_recommendation) fields.quiz_recommendation = quiz_recommendation;
    if (purchase_plan) fields.purchase_plan = purchase_plan;
    if (quiz_answers && Object.keys(quiz_answers).length > 0) {
      fields.quiz_answers = Object.entries(quiz_answers).map(([k, v]) => `${k}: ${v}`).join(", ");
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": kitKey,
    };

    // Step 1: Create or update the subscriber directly
    const createRes = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers,
      body: JSON.stringify({
        email_address: email,
        first_name: firstName,
        state: "active",
        fields,
      }),
    });

    let subscriberId = null;
    if (createRes.ok) {
      const data = await createRes.json();
      subscriberId = data?.subscriber?.id;
      console.log("Kit subscriber created/updated:", subscriberId, "| lifecycle:", lifecycle_stage || "lead");
    } else {
      const createErr = await createRes.text();
      console.warn("Kit direct create failed:", createRes.status, createErr);
    }

    // Step 2: Subscribe to the first available form (makes them visible in dashboard + triggers automations)
    let formSubscribed = false;
    try {
      const formsRes = await fetch("https://api.kit.com/v4/forms", { headers });
      const formsData = await formsRes.json();
      const form = formsData?.forms?.[0];

      if (form) {
        const formSubRes = await fetch(`https://api.kit.com/v4/forms/${form.id}/subscribers`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            email_address: email,
            first_name: firstName,
            fields,
          }),
        });

        if (formSubRes.ok) {
          const formData = await formSubRes.json();
          if (!subscriberId) subscriberId = formData?.subscriber?.id;
          formSubscribed = true;
          console.log("Kit subscriber subscribed to form:", form.id, "| name:", form.name);
        } else {
          const formErr = await formSubRes.text();
          console.warn("Kit form subscribe failed:", formSubRes.status, formErr);
        }
      } else {
        console.warn("No Kit forms found to subscribe to");
      }
    } catch (formErr) {
      console.warn("Kit form subscription error:", formErr.message);
    }

    if (subscriberId || formSubscribed) {
      return Response.json({ success: true, kit_id: subscriberId, form_subscribed: formSubscribed });
    }

    return Response.json({ error: "Kit sync failed — no subscriber created or form subscribed" }, { status: 500 });
  } catch (error) {
    console.error("syncLeadToKit error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});