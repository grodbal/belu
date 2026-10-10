export default function BeluerLoading() {
  return (
    <main aria-labelledby="beluer-loading-title" aria-busy="true" className="w-full animate-pulse">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A34B5C]">Panel Beluer</p>
      <h1 id="beluer-loading-title" className="mb-6 text-3xl font-bold text-[#302A2B]">Cargando tu panel…</h1>
      <div className="mb-6 h-20 rounded-2xl border border-[#EEE5E5] bg-white" />
      <div className="mb-3 h-5 w-32 rounded bg-[#EEE5E5]" />
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-52 rounded-[21px] border border-[#EEE5E5] bg-white p-6">
            <div className="mb-5 h-4 w-24 rounded bg-[#F3ECEC]" />
            <div className="mb-8 h-7 w-3/4 rounded bg-[#F3ECEC]" />
            <div className="h-12 rounded bg-[#F8F5F4]" />
          </div>
        ))}
      </div>
    </main>
  );
}
