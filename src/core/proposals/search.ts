import type { PortfolioEvidence } from "@/core/proposals/types";
export function searchPortfolio(
  items: PortfolioEvidence[],
  query: string,
  kind?: string,
) {
  const needle = query.trim().toLowerCase();
  return items.filter(
    (item) =>
      (!kind || kind === "all" || item.kind === kind) &&
      (!needle ||
        [item.title, item.description, ...item.skills, ...item.achievements]
          .join(" ")
          .toLowerCase()
          .includes(needle)),
  );
}
