import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft } from "lucide-react";

const POLICY_KEYS = {
  "privacy-policy": "Privacy Policy",
  "terms-of-use": "Terms of Use",
  "refund-policy": "Refund Policy",
  "accessibility-statement": "Accessibility Statement",
  "consumer-health-statement": "Consumer Health Statement",
};

export default function PolicyPage() {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const title = POLICY_KEYS[slug] || "Policy";

  useEffect(() => {
    base44.entities.SiteContent.list().then((records) => {
      const rec = records.find((r) => r.section_key === `policy_${slug}`);
      setContent(rec?.data?.body || "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-orange-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg text-off-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-white-muted hover:text-orange-red transition-colors mb-10 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <h1 className="font-heading text-5xl font-bold uppercase tracking-tight mb-10">{title}</h1>
        {content ? (
          <div
            className="font-body text-white-muted leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br/>") }}
          />
        ) : (
          <p className="font-body text-white-muted">Content coming soon.</p>
        )}
      </div>
    </div>
  );
}