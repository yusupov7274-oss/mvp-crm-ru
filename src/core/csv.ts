// Утилиты для генерации и скачивания CSV-файлов (разделитель — ';')

/**
 * Преобразует двумерный массив данных в CSV-строку.
 * Каждую ячейку экранируем, если есть ; " или перевод строки.
 */
export function toCSV(rows: (string | number)[][]): string {
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map(r => r.map(esc).join(";")).join("\n");
}

/**
 * Скачивает CSV как файл в браузере.
 * @param filename имя файла (например, "summary.csv")
 * @param content CSV-текст
 */
export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
