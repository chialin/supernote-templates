"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Template, Locale, getTemplatePreviewPath } from "@/lib/templates";

type TemplateCardProps = {
  template: Template;
};

export default function TemplateCard({ template }: TemplateCardProps) {
  const locale = useLocale() as Locale;
  const { name, description } = template.i18n[locale];
  const previewPath = getTemplatePreviewPath(template.id);

  return (
    <Link href={`/${locale}/templates/${template.id}`}>
      <Card className="h-full cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-zinc-400 dark:hover:border-zinc-600">
        <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <div className="relative h-full w-full">
            <Image
              src={previewPath}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain"
              loading="lazy"
            />
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-lg">{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
