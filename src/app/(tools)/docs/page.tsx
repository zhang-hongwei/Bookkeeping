import { getReadmeContent } from "./_config/doc-config";
import { DocLayout } from "./_components/DocLayout";
import { DocContent } from "./_components/DocContent";

export default async function DocsIndexPage() {
  const content = await getReadmeContent();

  return (
    <DocLayout>
      {content ? (
        <DocContent content={content} />
      ) : (
        <p>No documentation found.</p>
      )}
    </DocLayout>
  );
}
