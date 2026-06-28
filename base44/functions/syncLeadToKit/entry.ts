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

    // Primary method: direct subscriber creation (creates or updates — returns 200 if exists)
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

    if (createRes.ok) {
      const data = await createRes.json();
      const subId = data?.subscriber?.id;
      console.log("Kit subscriber synced directly:", subId, "| lifecycle:", lifecycle_stage || "lead");
      return Response.json({ success: true, kit_id: subId });
    }

    // If direct creation fails, log and fall back to forms/sequences
    const createErr = await createRes.text();
    console.warn("Kit direct create failed:", createRes.status, createErr);

    // Fallback: try forms
    let formsRes = await fetch("https://api.kit.com/v4/forms?type=embed", { headers });
    let formsData = await formsRes.json();
    if (!formsData?.forms?.length) {
      formsRes = await fetch("https://api.kit.com/v4/forms?type=hosted", { headers });
      formsData = await formsRes.json();
    }
    if (!formsData?.forms?.length) {
      formsRes = await fetch("https://api.kit.com/v4/forms", { headers });
      formsData = await formsRes.json();
    }

    const candidateForm = formsData?.forms?.[0];

    if (candidateForm) {
      const formSubRes = await fetch(`https://api.kit.com/v4/forms/${candidateForm.id}/subscribers`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email_address: email, first_name: firstName, fields }),
      });

      if (formSubRes.ok) {
        const formData = await formSubRes.json();
        const subId = formData?.subscriber?.id;
        console.log("Kit subscriber synced via form:", subId, "| lifecycle:", lifecycle_stage || "lead");
        return Response.json({ success: true, kit_id: subId });
      }

      if (formSubRes.status !== 404) {
        const formErr = await formSubRes.json();
        console.error("Kit form subscribe failed:", JSON.stringify(formErr));
        return Response.json({ error: "Kit sync failed", details: formErr, formId: candidateForm.id }, { status: 500 });
      }
    }

    // Fallback: try sequences
    const seqRes = await fetch("https://api.kit.com/v4/sequences", { headers });
    const seqData = await seqRes.json();
    const sequenceId = seqData?.sequences?.[0]?.id;

    if (sequenceId) {
      const seqSubRes = await fetch(`https://api.kit.com/v4/sequences/${sequenceId}/subscribers`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email_address: email, first_name: firstName }),
      });

      if (seqSubRes.ok) {
        const seqSubData = await seqSubRes.json();
        const subId = seqSubData?.subscriber?.id;
        console.log("Kit subscriber synced via sequence:", subId, "| lifecycle:", lifecycle_stage || "lead");
        return Response.json({ success: true, kit_id: subId });
      }

      const seqErr = await seqSubRes.json();
      console.error("Kit sequence subscribe failed:", JSON.stringify(seqErr));
      return Response.json({ error: "Kit sequence subscribe failed", details: seqErr, sequenceId }, { status: 500 });
    }

    return Response.json({
      error: "All Kit sync methods failed",
      direct_error: createErr,
      formsDebug: formsData?.forms?.map(f => ({ id: f.id, name: f.name, type: f.type })),
    }, { status: 500 });
  } catch (error) {
    console.error("syncLeadToKit error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});