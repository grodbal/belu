import Link from "next/link";

type MainNavProps = {
  variant?: "clientas" | "beluers";
};

export default function MainNav({ variant = "clientas" }: MainNavProps) {
  const isBeluers = variant === "beluers";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-5 bg-white/90 backdrop-blur-xl border-b border-black/5">
      <Link href="/" className="text-3xl font-black tracking-[-0.06em] text-[#E60023]">
        belu<span className="text-[#E60023]">✦</span>
      </Link>

      {isBeluers ? (
        <Link
          href="#aplicar"
          className="bg-[#E60023] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#C4001D] transition"
        >
          Aplicar ahora
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <Link
  href="/login"
  className="bg-white text-[#111111] px-6 py-3 rounded-full text-sm font-bold border border-black/15 hover:border-[#E60023] hover:text-[#E60023] transition"
>
  Mi cuenta
</Link>

          <Link
            href="/app/clienta"
            className="bg-[#E60023] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#C4001D] transition"
          >
            Reservar
          </Link>
        </div>
      )}
    </nav>
  );
}