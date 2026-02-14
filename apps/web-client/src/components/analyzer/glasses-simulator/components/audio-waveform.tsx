"use client";

/** Animated waveform bars — visual indicator for voice intake */
export function AudioWaveform({
  active,
  accentClass,
  glowColor,
}: {
  active: boolean;
  accentClass: string;
  glowColor: string;
}) {
  return (
    <div className="flex items-end gap-0.5 h-4" aria-label="Audio waveform">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`inline-block w-[2.5px] rounded-full ${accentClass} transition-all duration-150`}
          style={{
            height: active ? undefined : "3px",
            animation: active
              ? `hud-wave 0.8s ease-in-out ${i * 0.1}s infinite alternate`
              : "none",
            filter: active ? `drop-shadow(0 0 4px ${glowColor})` : "none",
            willChange: "transform, height",
          }}
        />
      ))}
    </div>
  );
}
