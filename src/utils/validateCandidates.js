export const validateCandidates = (data) => {
  const errors = [];
  const ids = new Set();

  data.forEach((candidate, index) => {
    const rowNum = index + 2;
    if (!candidate.candidate_id || !candidate.name || !candidate.grade) {
      errors.push(`Row ${rowNum}: Missing required fields`);
    }

    if (candidate.candidate_id) {
      if (ids.has(candidate.candidate_id)) {
        errors.push(`Row ${rowNum}: Duplicate candidate_id "${candidate.candidate_id}"`);
      } else {
        ids.add(candidate.candidate_id);
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (candidate.email && !emailRegex.test(candidate.email)) {
      errors.push(`Row ${rowNum}: Invalid email`);
    }

    const phoneRegex = /^\d{10}$/;
    if (candidate.phone && !phoneRegex.test(candidate.phone.toString())) {
      errors.push(`Row ${rowNum}: Invalid phone number`);
    }

    if (candidate.dob && isNaN(Date.parse(candidate.dob))) {
      errors.push(`Row ${rowNum}: Invalid date of birth`);
    }
  });

  return errors;
};
