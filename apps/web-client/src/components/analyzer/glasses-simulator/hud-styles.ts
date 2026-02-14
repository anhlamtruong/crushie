/** Injected once via <style> — keyframes & per-theme pseudo-element decorations */
export const HUD_STYLES = `
@keyframes hud-wave {
  0%   { height: 3px; }
  100% { height: 14px; }
}
@keyframes hud-scanline {
  0%   { transform: translate3d(0, 0%, 0); }
  100% { transform: translate3d(0, 100%, 0); }
}
@keyframes hud-flicker {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.96; }
}
@keyframes hud-grain {
  0%, 100% { transform: translate(0, 0); }
  10%      { transform: translate(-1%, -1%); }
  30%      { transform: translate(1%, 2%); }
  50%      { transform: translate(-2%, 1%); }
  70%      { transform: translate(2%, -1%); }
  90%      { transform: translate(1%, 1%); }
}
@keyframes sparkle-float {
  0%   { transform: translateY(0) scale(1); opacity: 0.7; }
  50%  { transform: translateY(-6px) scale(1.3); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 0.7; }
}
@keyframes ctx-slide-in {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}
.aviator-grid::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(251,191,36,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(251,191,36,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  z-index: 1;
}
.ethereal-sparkle::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(244,114,182,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 70% 20%, rgba(244,114,182,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 45% 75%, rgba(244,114,182,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 65%, rgba(244,114,182,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 15% 80%, rgba(244,114,182,0.3) 0%, transparent 100%);
  animation: sparkle-float 4s ease-in-out infinite;
}
`;
