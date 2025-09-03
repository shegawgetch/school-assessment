export const validateCandidates = (data) => {
  const errors = [];
  const emails = new Set();

  data.forEach((candidate, index) => {
    const rowNum = index + 2;
    const email = candidate.email?.trim();

    if (!email) {
      errors.push(`Row ${rowNum}: Email is required`);
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Row ${rowNum}: Invalid email`);
      } else if (emails.has(email)) {
        errors.push(`Row ${rowNum}: Duplicate email "${email}"`);
      } else {
        emails.add(email);
      }
    }
  });

  return errors;
};
