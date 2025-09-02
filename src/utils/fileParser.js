import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const parseCandidateFile = (file) => {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;

      if (ext === 'csv') {
        const result = Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
        });
        resolve(result.data);
      } else if (ext === 'xlsx') {
        const workbook = XLSX.read(data, { type: 'array' }); // array mode
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } else {
        reject('Unsupported file format');
      }
    };

    if (ext === 'csv') {
      reader.readAsText(file);
    } else if (ext === 'xlsx') {
      reader.readAsArrayBuffer(file); // ✅ fixed here
    } else {
      reject('Unsupported file format');
    }
  });
};
