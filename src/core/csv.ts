// Экспорт массива строк в CSV и скачивание в браузере

export function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? '');
          // Экранирование: если есть запятая/кавычки/перенос — оборачиваем в кавычки и дублируем кавычки
          if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        })
        .join(';') // разделитель — ; для русской локали
    )
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM для Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
