import { getSiteSettings } from "@/lib/data";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsForm currentLogoUrl={settings.logoUrl} />;
}
