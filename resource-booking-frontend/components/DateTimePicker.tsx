"use client";

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export default function DateTimePicker({
  label,
  value,
  onChange,
}: Props) {
  return (
    <div className="space-y-2">
      <label className="block font-medium text-indigo-700">
        {label}
      </label>

      <input
        type="datetime-local"
        value={value ? value.toISOString().slice(0, 16) : ""}
        onChange={(e) =>
          onChange(e.target.value ? new Date(e.target.value) : null)
        }
        className="w-full rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-gray-700 focus:ring-2 focus:ring-pink-400 outline-none"
      />
    </div>
  );
}
