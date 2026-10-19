export function canAttachDemoAsset(asset: {
  status: string;
  verified: boolean;
  url?: string | null;
  filePath?: string | null;
}) {
  return (
    asset.status === "completed" &&
    asset.verified &&
    Boolean(asset.url || asset.filePath)
  );
}
