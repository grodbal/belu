import ClientePanelOriginalPage from "@/components/cliente-panel-original/ClientePanelOriginalPage";
import LogoutButton from "@/components/auth/LogoutButton";

export default function ClientePanelPage() {
  return (
    <>
      <ClientePanelOriginalPage />

      <LogoutButton className="fixed right-6 bottom-6 z-50 rounded-full bg-[#E60023] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#C4001D] transition" />
    </>
  );
}