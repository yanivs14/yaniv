import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export const COUNTRIES = [
  { code: "AF", name: "Afghanistan", dial: "+93" },
  { code: "AL", name: "Albania", dial: "+355" },
  { code: "DZ", name: "Algeria", dial: "+213" },
  { code: "AR", name: "Argentina", dial: "+54" },
  { code: "AM", name: "Armenia", dial: "+374" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "AT", name: "Austria", dial: "+43" },
  { code: "AZ", name: "Azerbaijan", dial: "+994" },
  { code: "BH", name: "Bahrain", dial: "+973" },
  { code: "BD", name: "Bangladesh", dial: "+880" },
  { code: "BY", name: "Belarus", dial: "+375" },
  { code: "BE", name: "Belgium", dial: "+32" },
  { code: "BZ", name: "Belize", dial: "+501" },
  { code: "BO", name: "Bolivia", dial: "+591" },
  { code: "BA", name: "Bosnia and Herzegovina", dial: "+387" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "BG", name: "Bulgaria", dial: "+359" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "CL", name: "Chile", dial: "+56" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "CO", name: "Colombia", dial: "+57" },
  { code: "CR", name: "Costa Rica", dial: "+506" },
  { code: "HR", name: "Croatia", dial: "+385" },
  { code: "CY", name: "Cyprus", dial: "+357" },
  { code: "CZ", name: "Czech Republic", dial: "+420" },
  { code: "DK", name: "Denmark", dial: "+45" },
  { code: "EC", name: "Ecuador", dial: "+593" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "EE", name: "Estonia", dial: "+372" },
  { code: "ET", name: "Ethiopia", dial: "+251" },
  { code: "FI", name: "Finland", dial: "+358" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "GE", name: "Georgia", dial: "+995" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "GH", name: "Ghana", dial: "+233" },
  { code: "GR", name: "Greece", dial: "+30" },
  { code: "GT", name: "Guatemala", dial: "+502" },
  { code: "HN", name: "Honduras", dial: "+504" },
  { code: "HK", name: "Hong Kong", dial: "+852" },
  { code: "HU", name: "Hungary", dial: "+36" },
  { code: "IS", name: "Iceland", dial: "+354" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "ID", name: "Indonesia", dial: "+62" },
  { code: "IE", name: "Ireland", dial: "+353" },
  { code: "IL", name: "Israel", dial: "+972" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "JM", name: "Jamaica", dial: "+1-876" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "JO", name: "Jordan", dial: "+962" },
  { code: "KZ", name: "Kazakhstan", dial: "+7" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "KW", name: "Kuwait", dial: "+965" },
  { code: "LV", name: "Latvia", dial: "+371" },
  { code: "LB", name: "Lebanon", dial: "+961" },
  { code: "LT", name: "Lithuania", dial: "+370" },
  { code: "LU", name: "Luxembourg", dial: "+352" },
  { code: "MY", name: "Malaysia", dial: "+60" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "MD", name: "Moldova", dial: "+373" },
  { code: "MA", name: "Morocco", dial: "+212" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "NO", name: "Norway", dial: "+47" },
  { code: "OM", name: "Oman", dial: "+968" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "PA", name: "Panama", dial: "+507" },
  { code: "PY", name: "Paraguay", dial: "+595" },
  { code: "PE", name: "Peru", dial: "+51" },
  { code: "PH", name: "Philippines", dial: "+63" },
  { code: "PL", name: "Poland", dial: "+48" },
  { code: "PT", name: "Portugal", dial: "+351" },
  { code: "QA", name: "Qatar", dial: "+974" },
  { code: "RO", name: "Romania", dial: "+40" },
  { code: "RU", name: "Russia", dial: "+7" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "RS", name: "Serbia", dial: "+381" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "SK", name: "Slovakia", dial: "+421" },
  { code: "SI", name: "Slovenia", dial: "+386" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "KR", name: "South Korea", dial: "+82" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "LK", name: "Sri Lanka", dial: "+94" },
  { code: "SE", name: "Sweden", dial: "+46" },
  { code: "CH", name: "Switzerland", dial: "+41" },
  { code: "TW", name: "Taiwan", dial: "+886" },
  { code: "TH", name: "Thailand", dial: "+66" },
  { code: "TN", name: "Tunisia", dial: "+216" },
  { code: "TR", name: "Turkey", dial: "+90" },
  { code: "UA", name: "Ukraine", dial: "+380" },
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "UY", name: "Uruguay", dial: "+598" },
  { code: "UZ", name: "Uzbekistan", dial: "+998" },
  { code: "VE", name: "Venezuela", dial: "+58" },
  { code: "VN", name: "Vietnam", dial: "+84" },
  { code: "YE", name: "Yemen", dial: "+967" },
  { code: "ZM", name: "Zambia", dial: "+260" },
  { code: "ZW", name: "Zimbabwe", dial: "+263" },
];

/** Compact dial-code picker shown inline next to the phone input */
export function DialCodePicker({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = COUNTRIES.find(c => c.code === value);
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  );

  const handleOpen = () => { setOpen(true); setSearch(""); };
  const handleClose = () => { setOpen(false); setSearch(""); };
  const handleSelect = (code) => { onChange(code); handleClose(); };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`h-full flex items-center gap-1 px-3 bg-dark-bg border-r font-body text-sm transition-colors focus:outline-none whitespace-nowrap ${
          error ? "border-red-500" : "border-dark-border"
        } ${open ? "text-orange-red" : "text-off-white hover:text-orange-red"}`}
      >
        <span>{selected ? selected.dial : "+"}</span>
        <ChevronDown className="w-3 h-3 text-white-muted" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-sm bg-dark-surface border border-dark-border rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
              <span className="font-body text-sm font-semibold text-off-white">Select Country</span>
              <button type="button" onClick={handleClose} className="text-white-muted hover:text-off-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Search */}
            <div className="px-4 py-2 border-b border-dark-border flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-white-dim flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country or +code..."
                className="flex-1 bg-transparent font-body text-off-white placeholder-white-dim focus:outline-none"
                style={{ fontSize: "16px" }}
                autoFocus
              />
            </div>
            {/* List */}
            <div className="max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-4 text-sm font-body text-white-muted text-center">No results</p>
              ) : (
                filtered.map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={`w-full text-left px-4 py-3 font-body text-sm flex items-center justify-between hover:bg-dark-bg transition-colors border-b border-dark-border/40 ${
                      value === c.code ? "text-orange-red" : "text-off-white"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-white-muted ml-3 text-xs">{c.dial}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}