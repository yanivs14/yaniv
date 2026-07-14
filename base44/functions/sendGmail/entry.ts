import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { to, subject, html, from_name } = await req.json();

    if (!to || !subject || !html) {
      return Response.json({ error: 'Missing required fields: to, subject, html' }, { status: 400 });
    }

    // Get Gmail OAuth access token from the shared connector
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    if (!accessToken) {
      throw new Error('Gmail connector not connected — authorize it in the admin panel');
    }

    // Build RFC 2822 MIME message (UTF-8 safe via base64 encoding)
    const raw = buildRawEmail(to, from_name || 'The Movement', subject, html);

    // Send via Gmail API
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gmail API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    console.log(`Gmail sent to ${to}, messageId: ${data.id}`);
    return Response.json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('sendGmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function buildRawEmail(to, fromName, subject, html) {
  const lines = [
    `To: ${to}`,
    `From: ${fromName}`,
    `Subject: =?UTF-8?B?${utf8ToBase64(subject)}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    utf8ToBase64(html),
  ];
  const mime = lines.join('\r\n');
  return utf8ToBase64(mime).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}