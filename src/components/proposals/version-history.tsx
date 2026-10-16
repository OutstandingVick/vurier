export function VersionHistory({
  versions,
}: {
  versions: Array<{
    id: string;
    version_number: number;
    source: string;
    tone: string | null;
    length: string | null;
    created_at: string;
  }>;
}) {
  return (
    <section className="rounded-2xl border bg-surface p-5">
      <h2 className="font-semibold">Version history</h2>
      <ol className="mt-3 space-y-2">
        {versions.map((version) => (
          <li
            className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3 py-2 text-sm"
            key={version.id}
          >
            <span>
              Version {version.version_number} · {version.source}
              {version.tone ? ` · ${version.tone}` : ""}
            </span>
            <time className="text-xs text-muted" dateTime={version.created_at}>
              {new Date(version.created_at).toLocaleString()}
            </time>
          </li>
        ))}
      </ol>
    </section>
  );
}
