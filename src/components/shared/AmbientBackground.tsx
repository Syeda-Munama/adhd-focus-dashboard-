/**
 * Deliberately quiet: two soft, low-opacity blurred blobs that drift
 * almost imperceptibly (40-50s per loop). This exists so the app
 * doesn't feel like a flat gray box after the landing page's hero, but
 * it should never compete for attention with the actual task on
 * screen -- that would work against the whole point of the product.
 * Pure CSS animation (no JS/Framer Motion) since this runs on every
 * dashboard page for as long as someone's working.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="animate-drift-a absolute -left-24 -top-24 h-96 w-96 rounded-full bg-scatter-soft/25 blur-3xl" />
      <div className="animate-drift-b absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-clarity-soft/30 blur-3xl" />
    </div>
  );
}
