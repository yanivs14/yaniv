import React from "react";
import { useSiteContent } from "@/lib/SiteContentContext";
import { Plus, Trash2 } from "lucide-react";

function Field({ label, value, onChange, multiline = false }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-white-muted mb-1.5 font-body">{label}</label>
      {multiline ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={2}
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body resize-none focus:outline-none focus:border-orange-red transition-colors" />
      ) : (
        <input value={value || ""} onChange={e => onChange(e.target.value)}
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors" />
      )}
    </div>
  );
}

export default function MovementAgeQuizEditor() {
  const { content, update } = useSiteContent();
  if (!content) return null;
  const q = content.movementAgeQuiz;
  if (!q) return null;

  const updateQuestion = (i, field, val) => {
    const questions = q.questions.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    update("movementAgeQuiz", "questions", questions);
  };

  const updateOption = (qi, oi, val) => {
    const questions = q.questions.map((item, idx) => {
      if (idx !== qi) return item;
      const options = item.options.map((opt, oidx) => oidx === oi ? val : opt);
      return { ...item, options };
    });
    update("movementAgeQuiz", "questions", questions);
  };

  const addOption = (qi) => {
    const questions = q.questions.map((item, idx) => idx === qi ? { ...item, options: [...item.options, "New option"] } : item);
    update("movementAgeQuiz", "questions", questions);
  };

  const removeOption = (qi, oi) => {
    const questions = q.questions.map((item, idx) => {
      if (idx !== qi) return item;
      return { ...item, options: item.options.filter((_, oidx) => oidx !== oi) };
    });
    update("movementAgeQuiz", "questions", questions);
  };

  const updateVideoRouting = (i, val) => {
    const videoRouting = q.videoRouting.map((v, idx) => idx === i ? val : v);
    update("movementAgeQuiz", "videoRouting", videoRouting);
  };

  return (
    <div>
      <p className="text-xs text-white-muted mb-5 font-body leading-relaxed">
        Edit the quiz questions, options, and result-screen text. Scoring and plan routing use option positions (indexes), so editing the text won't break the logic.
      </p>

      {/* Questions */}
      <div className="space-y-4 mb-6">
        {q.questions.map((item, qi) => (
          <div key={item.id} className="border border-[#2a2a2a] rounded-xl p-4 bg-[#111]">
            <p className="text-[11px] text-orange-red font-bold uppercase tracking-widest mb-3">
              Question {qi + 1}
            </p>
            <Field
              label="Question text"
              value={item.question}
              onChange={v => updateQuestion(qi, "question", v)}
              multiline
            />
            <label className="block text-xs text-white-muted mb-2 font-body">Answer options</label>
            <div className="space-y-2">
              {item.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <span className="text-[10px] text-white-dim w-4 text-center flex-shrink-0">{oi}</span>
                  <input
                    value={opt}
                    onChange={e => updateOption(qi, oi, e.target.value)}
                    className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-off-white font-body focus:outline-none focus:border-orange-red transition-colors"
                  />
                  <button
                    onClick={() => removeOption(qi, oi)}
                    className="text-white-muted hover:text-red-400 transition-colors p-1 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => addOption(qi)}
              className="flex items-center gap-1.5 text-xs text-orange-red hover:text-orange-red transition-colors mt-2.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add option
            </button>
          </div>
        ))}
      </div>

      {/* Video Routing */}
      <div className="border border-[#2a2a2a] rounded-xl p-4 bg-[#111] mb-6">
        <p className="text-[11px] text-orange-red font-bold uppercase tracking-widest mb-1">Video Routing (by Q3 option)</p>
        <p className="text-xs text-white-dim mb-3">Maps each Q3 answer to a recommended drill. Order matches the Q3 options above.</p>
        {q.videoRouting?.map((v, i) => (
          <Field
            key={i}
            label={`Q3 option ${i + 1} → drill`}
            value={v}
            onChange={val => updateVideoRouting(i, val)}
          />
        )) || null}
      </div>

      {/* Email & Results Text */}
      <div className="border border-[#2a2a2a] rounded-xl p-4 bg-[#111]">
        <p className="text-[11px] text-orange-red font-bold uppercase tracking-widest mb-3">Email & Results Screen</p>
        <Field label="Email headline" value={q.emailHeadline} onChange={v => update("movementAgeQuiz", "emailHeadline", v)} />
        <Field label="Email subhead" value={q.emailSubhead} onChange={v => update("movementAgeQuiz", "emailSubhead", v)} multiline />
        <Field label="Email CTA button" value={q.emailCta} onChange={v => update("movementAgeQuiz", "emailCta", v)} />
        <Field label="Results label" value={q.resultsLabel} onChange={v => update("movementAgeQuiz", "resultsLabel", v)} />
        <Field label="Limiter label" value={q.limiterLabel} onChange={v => update("movementAgeQuiz", "limiterLabel", v)} />
        <Field label="Video section label" value={q.videoLabel} onChange={v => update("movementAgeQuiz", "videoLabel", v)} />
        <Field label="Plan label" value={q.planLabel} onChange={v => update("movementAgeQuiz", "planLabel", v)} />
        <Field label="Confirmation text (use {limiter} placeholder)" value={q.confirmationText} onChange={v => update("movementAgeQuiz", "confirmationText", v)} multiline />
        <Field label="Done button" value={q.doneButton} onChange={v => update("movementAgeQuiz", "doneButton", v)} />
      </div>
    </div>
  );
}