import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Locale } from "@/i18n/routing";
import { getTemplates } from "@/lib/templates";
import TemplateCard from "@/components/TemplateCard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations();
  const templates = getTemplates();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            {t("home.title")}
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {t("home.description")}
          </p>
        </header>

        {templates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              {t("templates.empty")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
