import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  getTemplateById,
  getAllTemplateIds,
  getTemplatePreviewPath,
  getTemplateDownloadPath,
  Locale as TemplateLocale,
} from "@/lib/templates";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export function generateStaticParams() {
  const templateIds = getAllTemplateIds();
  const params: { locale: string; id: string }[] = [];

  for (const locale of routing.locales) {
    for (const id of templateIds) {
      params.push({ locale, id });
    }
  }

  return params;
}

export default async function TemplateDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);

  const template = getTemplateById(id);

  if (!template) {
    notFound();
  }

  return <TemplateDetailContent templateId={id} locale={locale as Locale} />;
}

type ContentProps = {
  templateId: string;
  locale: Locale;
};

function TemplateDetailContent({ templateId, locale }: ContentProps) {
  const t = useTranslations("templates");
  const template = getTemplateById(templateId)!;
  const { name, description } = template.i18n[locale as TemplateLocale];
  const previewPath = getTemplatePreviewPath(templateId);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t("backToList")}
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={previewPath}
                alt={name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
              {name}
            </h1>

            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              {description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {template.devices.map((device) => (
                <Button key={device} asChild size="lg" className="flex-1">
                  <a
                    href={getTemplateDownloadPath(templateId, device)}
                    download={`${templateId}-${device}.png`}
                  >
                    {t("downloadFor", {
                      device: t(
                        `devices.${device}` as "devices.nomad" | "devices.manta"
                      ),
                    })}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
