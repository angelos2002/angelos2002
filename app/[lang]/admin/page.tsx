import type { Metadata } from "next";
import { AdminLogin, AdminReviews } from "@/components/AdminPanel";
import { AdminStores } from "@/components/AdminStores";
import { getOverrides } from "@/lib/store-status";
import { isAdmin } from "@/lib/admin";
import { getDictionary, type Locale } from "@/lib/i18n";
import { isDemo, listAll } from "@/lib/review-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDictionary(lang);
  const authed = await isAdmin();
  return (
    <div className="container-x pb-20 pt-24 md:pt-32">
      <h1 className="heading mb-8 text-5xl md:text-6xl">Admin</h1>
      {!process.env.ADMIN_PASSWORD && (
        <p className="glass mb-6 p-4 text-sm text-ember">Set ADMIN_PASSWORD in your environment to enable moderation.</p>
      )}
      {isDemo() && <p className="mb-6 text-sm text-cream-dim">{t.reviews.demo}</p>}
      {authed ? (
        <>
          <AdminStores initial={await getOverrides()} />
          <h2 className="heading mb-4 text-3xl">{t.admin.title}</h2>
          <AdminReviews initial={await listAll()} />
        </>
      ) : (
        <AdminLogin />
      )}
    </div>
  );
}
