import { Search } from "lucide-react";

export function SearchBox({
  action,
  placeholder,
  defaultValue,
  hiddenFields,
}: {
  action: string;
  placeholder: string;
  defaultValue?: string;
  hiddenFields?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} className="relative max-w-sm flex-1">
      {Object.entries(hiddenFields ?? {}).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null,
      )}
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
      <input
        type="text"
        name="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-zinc-700 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
      />
    </form>
  );
}
