import { useState } from "react"; 
import axios from "axios";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const CandidateFormDynamic = () => {
  const [emails, setEmails] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailChange = (index, value) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  const addEmailField = () => setEmails([...emails, ""]);

  const removeEmailField = (index) => {
    if (emails.length === 1) return;
    setEmails(emails.filter((_, i) => i !== index));
  };

  const validateEmails = () => {
    const trimmed = emails.map((e) => e.trim());
    if (trimmed.some((e) => !e)) {
      setError("Please fill in all email fields.");
      return false;
    }

    const invalids = trimmed.filter((e) => !isValidEmail(e));
    if (invalids.length) {
      setError(`Invalid email(s): ${invalids.join(", ")}`);
      return false;
    }

    const unique = new Set(trimmed);
    if (unique.size !== trimmed.length) {
      setError("Duplicate emails are not allowed.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!validateEmails()) return;

    setLoading(true);

    try {
      const trimmedEmails = emails.map((e) => e.trim());
      const payload =
        trimmedEmails.length === 1
          ? { email: trimmedEmails[0] }
          : { emails: trimmedEmails };

      const endpoint =
        trimmedEmails.length === 1
          ? "/api/candidates"
          : "/api/candidates/bulk";

      await axios.post(endpoint, payload);

      setSuccess("Candidate(s) added successfully!");
      setEmails([""]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow rounded space-y-6"
    >
      <h2 className="text-xl font-semibold mb-4">Add Candidate Emails</h2>

      {emails.map((email, i) => {
        const isInvalid = email.trim() && !isValidEmail(email);
        return (
          <div key={i} className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(i, e.target.value)}
              placeholder="user@gmail.com"
              className={`flex-grow px-3 py-2 border rounded-lg transition focus:outline-none
                ${
                  isInvalid
                    ? "border-red-500 focus:border-red-500 focus:ring-transparent"
                    : "border-gray-300 focus:border-gray-300 focus:ring-transparent"
                }`}
              disabled={loading}
            />
            {emails.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmailField(i)}
                disabled={loading}
                className="text-red-500 hover:text-red-700 text-lg font-bold rounded-lg"
                title="Remove email"
              >
                &times;
              </button>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addEmailField}
        disabled={loading}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline transition"
      >
        + Add another email
      </button>

      {error && (
        <p className="text-red-600 font-medium" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-600 font-medium" role="status">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default CandidateFormDynamic;
