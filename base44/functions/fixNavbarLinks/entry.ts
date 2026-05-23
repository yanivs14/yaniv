import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const NEW_LINKS = [
  { label: "The Program", href: "#program" },
  { label: "Who Is It For?", href: "#who" },
  { label: "Roye Gold", href: "#roye" },
  { label: "FAQ", href: "#faq" },
  { label: "Pricing", href: "#pricing" },
  { label: "Inner Circle", href: "#inner-circle" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Find the navbar record in DB
    const records = await base44.asServiceRole.entities.SiteContent.list();
    const navbarRec = records.find(r => r.section_key === 'navbar');

    if (navbarRec) {
      // Preserve all existing navbar fields, only update links
      const updatedData = { ...navbarRec.data, links: NEW_LINKS };
      await base44.asServiceRole.entities.SiteContent.update(navbarRec.id, { data: updatedData });
      console.log('Updated navbar record:', navbarRec.id);
    } else {
      // No navbar record in DB — nothing to do, defaults will apply from code
      console.log('No navbar record found in DB — defaults will be used');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('fixNavbarLinks error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});