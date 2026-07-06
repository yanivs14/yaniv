import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — admin only' }, { status: 403 });
    }

    let body = {};
    try { body = await req.json(); } catch {}
    const action = body.action;

    if (action === 'load') {
      const notes = await base44.asServiceRole.entities.MeetingNote.list('-updated_date', 1000);
      const notesMap = {};
      for (const n of notes) {
        if (n.event_uuid) {
          notesMap[n.event_uuid] = {
            id: n.id,
            notes: n.notes || '',
            updated_date: n.updated_date,
          };
        }
      }
      return Response.json({ notesMap, total: notes.length });
    }

    if (action === 'save') {
      const { event_uuid, invitee_email, invitee_name, event_name, start_time, notes } = body;
      if (!event_uuid) {
        return Response.json({ error: 'event_uuid is required' }, { status: 400 });
      }

      const existing = await base44.asServiceRole.entities.MeetingNote.filter(
        { event_uuid },
        '-updated_date',
        1
      );

      if (existing.length > 0) {
        const updated = await base44.asServiceRole.entities.MeetingNote.update(
          existing[0].id,
          { notes: notes || '' }
        );
        return Response.json({ note: updated });
      } else {
        const created = await base44.asServiceRole.entities.MeetingNote.create({
          event_uuid,
          invitee_email: invitee_email || '',
          invitee_name: invitee_name || '',
          event_name: event_name || '',
          start_time: start_time || '',
          notes: notes || '',
        });
        return Response.json({ note: created });
      }
    }

    if (action === 'delete') {
      const { event_uuid } = body;
      if (!event_uuid) {
        return Response.json({ error: 'event_uuid is required' }, { status: 400 });
      }
      const existing = await base44.asServiceRole.entities.MeetingNote.filter(
        { event_uuid },
        '-updated_date',
        1
      );
      if (existing.length > 0) {
        await base44.asServiceRole.entities.MeetingNote.delete(existing[0].id);
        return Response.json({ success: true });
      }
      return Response.json({ success: true, message: 'No note found' });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error("manageMeetingNote error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});