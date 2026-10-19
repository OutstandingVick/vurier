export function AnalyticsFilters({
  range,
  category,
  categories,
}: {
  range: string;
  category: string;
  categories: string[];
}) {
  return (
    <form
      className="grid gap-3 rounded-2xl bg-surface p-4 shadow-card sm:grid-cols-[12rem_1fr_auto]"
      aria-label="Analytics filters"
    >
      <label className="space-y-2 text-sm font-medium">
        Date range
        <select className="field" name="range" defaultValue={range}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="12m">Last 12 months</option>
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium">
        Job category
        <select className="field" name="category" defaultValue={category}>
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <button className="button-secondary self-end" type="submit">
        Apply filters
      </button>
    </form>
  );
}
