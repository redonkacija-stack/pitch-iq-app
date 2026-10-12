import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import FlagIcon from "./FlagIcon";
import { i18n, useLanguage } from "../i18n";

const languages = [
  { code: "en", name: "English", flag: "us" },
  { code: "es", name: "Español", flag: "es" },
  { code: "fr", name: "Français", flag: "fr" },
  { code: "de", name: "Deutsch", flag: "de" },
  { code: "ar", name: "العربية", flag: "sa" },
  { code: "pt", name: "Português", flag: "pt" },
];

export default function LanguageSelector() {
  const language = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const selected = languages.find((item) => item.code === language) || languages[0];

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function selectLanguage(code) {
    void i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Language: ${selected.name}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[.04] px-2.5 text-xs font-bold text-slate-200 transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 sm:gap-2 sm:px-3"
      >
        <FlagIcon code={selected.flag} label={`${selected.name} flag`} className="h-3.5 w-5" />
        <span className="uppercase tracking-wide">{selected.code}</span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Choose language"
          className="absolute right-0 top-full z-[60] mt-2 min-w-44 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Languages size={13} /> {i18n.t("language")}
          </div>
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              role="option"
              aria-selected={language === item.code}
              onClick={() => selectLanguage(item.code)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              <FlagIcon code={item.flag} label={`${item.name} flag`} className="h-3.5 w-5" />
              <span className="flex-1">{item.name}</span>
              {language === item.code && <Check size={14} className="text-emerald-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
