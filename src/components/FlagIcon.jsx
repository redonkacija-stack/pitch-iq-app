import { useState } from "react";
import { Globe2 } from "lucide-react";
import ar from "flag-icons/flags/4x3/ar.svg";
import br from "flag-icons/flags/4x3/br.svg";
import cr from "flag-icons/flags/4x3/cr.svg";
import de from "flag-icons/flags/4x3/de.svg";
import es from "flag-icons/flags/4x3/es.svg";
import fr from "flag-icons/flags/4x3/fr.svg";
import gbEng from "flag-icons/flags/4x3/gb-eng.svg";
import gbSct from "flag-icons/flags/4x3/gb-sct.svg";
import gbWls from "flag-icons/flags/4x3/gb-wls.svg";
import hr from "flag-icons/flags/4x3/hr.svg";
import it from "flag-icons/flags/4x3/it.svg";
import nl from "flag-icons/flags/4x3/nl.svg";
import no from "flag-icons/flags/4x3/no.svg";
import eg from "flag-icons/flags/4x3/eg.svg";
import pt from "flag-icons/flags/4x3/pt.svg";
import sa from "flag-icons/flags/4x3/sa.svg";
import se from "flag-icons/flags/4x3/se.svg";
import us from "flag-icons/flags/4x3/us.svg";
import uy from "flag-icons/flags/4x3/uy.svg";

const flagSources = {
  ar,
  br,
  cr,
  de,
  eg,
  es,
  fr,
  "gb-eng": gbEng,
  "gb-sct": gbSct,
  "gb-wls": gbWls,
  hr,
  it,
  nl,
  no,
  pt,
  sa,
  se,
  us,
  uy,
};

export default function FlagIcon({ code, label, className = "h-4 w-6" }) {
  const normalizedCode = code?.toLowerCase();
  const [failedCode, setFailedCode] = useState(null);
  const source = flagSources[normalizedCode];

  if (!source || failedCode === normalizedCode) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center text-slate-400 ${className}`}
        role="img"
        aria-label={label || "Nationality unavailable"}
        title={label || "Nationality unavailable"}
      >
        <Globe2 className="h-full w-full" strokeWidth={1.7} />
      </span>
    );
  }

  return (
    <img
      src={source}
      alt={label || `${normalizedCode.toUpperCase()} flag`}
      title={label || `${normalizedCode.toUpperCase()} flag`}
      className={`inline-block shrink-0 rounded-sm border border-slate-700/80 object-cover shadow-sm shadow-black/20 ${className}`}
      onError={() => setFailedCode(normalizedCode)}
    />
  );
}
