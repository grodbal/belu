import BeluerPanelOriginalPage from "@/components/beluer-panel-original/BeluerPanelOriginalPage";
import LogoutButton from "@/components/auth/LogoutButton";

export default function BeluerPanelPage() {
  return (
    <>
      <BeluerPanelOriginalPage />

      <LogoutButton className="fixed right-6 bottom-6 z-50 rounded-full bg-[#E60023] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#C4001D] transition" />
    </>
  );
}