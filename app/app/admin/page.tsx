import LogoutButton from "@/components/auth/LogoutButton";
import AdminPanelOriginalPage from "@/components/admin-panel-original/AdminPanelOriginalPage";
import CreateBeluerForm from "@/components/admin-panel-original/CreateBeluerForm";

export default function AdminPanelPage() {
  return (
    <>
      <AdminPanelOriginalPage />

      <CreateBeluerForm />

      <LogoutButton className="fixed right-6 bottom-6 z-50 rounded-full bg-[#E60023] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#C4001D] transition" />
    </>
  );
}