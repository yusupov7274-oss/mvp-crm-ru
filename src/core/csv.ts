export function toCSV(rows: Array<Array<string|number>>): string {
  const esc = (v: any) => {
    const s = String(v ?? "");
    // если есть ;"\n — экранируем в двойные кавычки
    if (/[;"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return rows.map(r => r.map(esc).join(";")).join("\n");
}

export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
