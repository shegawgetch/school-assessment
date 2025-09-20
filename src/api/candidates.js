import rawCandidates from "./candidates.json";

export const candidatesData = rawCandidates.map((c, index) => ({
  id: index + 1,
  name: c["Candidate Name"],
  email: c["Email"],
  phone: c["Phone"],
  field: c["Field of Study"],
  cgpa: c["CGPA"],
  skills: c["Skills"],
  jobMatch: c["Job Description Match (%)"],
  strength: c["Strength"],
  experience: parseInt(c["Experience"]) || 0,
}));
