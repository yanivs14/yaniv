import { SiteContentProvider } from "@/lib/SiteContentContext";

export default function HomeBackupLayout({ children }) {
  return (
    <SiteContentProvider keyPrefix="homeb_">
      {children}
    </SiteContentProvider>
  );
}