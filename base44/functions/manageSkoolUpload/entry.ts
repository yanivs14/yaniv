import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // GET active upload
    if (action === 'load') {
      const records = await base44.asServiceRole.entities.SkoolUpload.list('-created_date', 10);
      return Response.json({ uploads: records });
    }

    // SAVE new upload — mark all previous as inactive, then create
    if (action === 'save') {
      const { file_name, data } = body;
      if (!file_name || !data) {
        return Response.json({ error: 'file_name and data are required' }, { status: 400 });
      }

      // Deactivate all existing
      const existing = await base44.asServiceRole.entities.SkoolUpload.list('-created_date', 100);
      if (existing.length > 0) {
        await base44.asServiceRole.entities.SkoolUpload.bulkUpdate(
          existing.map(r => ({ id: r.id, is_active: false }))
        );
      }

      // Create new active record
      const created = await base44.asServiceRole.entities.SkoolUpload.create({
        file_name,
        data,
        is_active: true,
      });

      return Response.json({ upload: created });
    }

    // RESTORE — deactivate the active upload (remove from dashboard)
    if (action === 'restore') {
      const active = await base44.asServiceRole.entities.SkoolUpload.filter({ is_active: true }, '-created_date', 10);
      if (active.length > 0) {
        await base44.asServiceRole.entities.SkoolUpload.bulkUpdate(
          active.map(r => ({ id: r.id, is_active: false }))
        );
      }
      return Response.json({ restored: true, deactivated: active.length });
    }

    // RE-APPLY — activate a previously deactivated upload
    if (action === 'activate') {
      const { upload_id } = body;
      if (!upload_id) {
        return Response.json({ error: 'upload_id is required' }, { status: 400 });
      }
      // Deactivate all
      const all = await base44.asServiceRole.entities.SkoolUpload.list('-created_date', 100);
      if (all.length > 0) {
        await base44.asServiceRole.entities.SkoolUpload.bulkUpdate(
          all.map(r => ({ id: r.id, is_active: false }))
        );
      }
      // Activate the selected one
      const updated = await base44.asServiceRole.entities.SkoolUpload.update(upload_id, { is_active: true });
      return Response.json({ upload: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('manageSkoolUpload error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});