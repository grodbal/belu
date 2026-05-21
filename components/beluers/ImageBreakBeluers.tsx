export default function ImageBreakBeluers() {
  return (
    <section className="relative flex min-h-[55vh] items-center justify-center overflow-hidden px-6 py-24 text-center md:px-12 lg:px-20">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center transition-transform duration-[8000ms] hover:scale-100"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1920&q=85')",
        }}
      />

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="text-3xl font-black leading-tight tracking-[-0.04em] text-white md:text-5xl">
          “Tu talento merece un sistema
          <br />
          tan <span className="text-[#FFD6E2]">impecable</span> como tu
          trabajo.”
        </p>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-white/45">
          ✦ belu · Lima, Perú
        </p>
      </div>
    </section>
  );
}