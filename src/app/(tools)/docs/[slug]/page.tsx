import { notFound } from "next/navigation";
import { getDocContent, muiDocs } from "../_config/doc-config";
import { DocLayout } from "../_components/DocLayout";
import { DocContent } from "../_components/DocContent";

export function generateStaticParams() {
  return muiDocs.map((doc) => ({ slug: doc.slug }));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getDocContent(slug);

  if (!content) {
    notFound();
  }

  return (
    <DocLayout>
      <DocContent content={content} />
    </DocLayout>
  );
}
