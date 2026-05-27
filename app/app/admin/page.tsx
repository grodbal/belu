import AdminPanelOriginalPage from "@/components/admin-panel-original/AdminPanelOriginalPage";
import LogoutButton from "@/components/auth/LogoutButton";

export default function AdminPanelPage() {
  return (
    <>
      <AdminPanelOriginalPage />

      <LogoutButton className="fixed right-6 bottom-6 z-50 rounded-full bg-[#E60023] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#C4001D] transition" />
    </>
  );
}