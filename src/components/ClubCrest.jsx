import { useState } from "react";
import { Shield } from "lucide-react";

export default function ClubCrest({
  src,
  alt = "Club crest",
  className = "h-8 w-8",
  fallbackClassName = "h-5 w-5",
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700/80 bg-slate-800/80 shadow-md shadow-black/20 ${className}`}
      role="img"
      aria-label={alt}
      title={alt}
    >
      {src && !failed ? (
        <>
          {!loaded && (
            <span className="absolute inset-0 animate-pulse bg-white/[.08]" />
          )}
          <img
            src={src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className={`relative z-10 h-full w-full object-contain p-1 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </>
      ) : (
        <Shield
          className={`text-slate-400 ${fallbackClassName}`}
          strokeWidth={1.6}
        />
      )}
    </span>
  );
}
