// utils/exportCsv.js
export const exportToCsv = (data, filename = "candidates.csv") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Extract headers from object keys
  const headers = Object.keys(data[0]);

  // Convert array of objects into CSV rows
  const csvRows = [
    headers.join(","), // first row = headers
    ...data.map((row) =>
      headers
        .map((header) => {
          let val = row[header];
          if (val === null || val === undefined) return "";
          return `"${val.toString().replace(/"/g, '""')}"`; // escape quotes
        })
        .join(",")
    ),
  ];

  // Join rows with new lines
  const csvContent = csvRows.join("\n");

  // Download CSV file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
