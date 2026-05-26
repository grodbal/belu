import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FFD6E2] flex items-center justify-center px-6 py-10">
      <section className="w-full max-w-[420px] bg-white rounded-[28px] p-9 shadow-[0_24px_80px_rgba(230,0,35,0.14)] border border-[#E60023]/10">
        <div className="w-12 h-12 rounded-full bg-[#E60023] text-white flex items-center justify-center text-2xl mb-5">
          ✦
        </div>

        <p className="text-[#E60023] font-extrabold tracking-[0.08em] uppercase text-sm mb-2">
          belu
        </p>

        <h1 className="text-[#1A1A1A] text-[34px] leading-none font-extrabold tracking-[-0.04em] mb-3">
          Ingresa a tu cuenta
        </h1>

        <p className="text-[#555] text-[15px] leading-relaxed mb-7">
          Accede a tu panel como clienta, Beluer o administradora.
        </p>

        <LoginForm />

        <p className="text-center text-[#555] text-sm mt-6 mb-3">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="text-[#E60023] font-extrabold">
            Regístrate
          </Link>
        </p>

        <Link
          href="/"
          className="block text-center text-[#1A1A1A] text-sm font-bold"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}