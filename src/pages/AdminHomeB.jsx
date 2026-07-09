import { SiteContentProvider } from "@/lib/SiteContentContext";
import AdminK from "./AdminK";

export default function AdminHomeB() {
  return (
    <SiteContentProvider keyPrefix="homeb_">
      <AdminK homePath="/home-b" />
    </SiteContentProvider>
  );
}