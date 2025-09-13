import { useState, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const CandidateFormDynamic = ({ onAdd, selectedAssessment }) => {
  const [emails, setEmails] = useState([{ value: "", error: "" }]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleEmailChange = (index, value) => {
    const updated = [...emails];
    updated[index].value = value;
    updated[index].error = "";
    setEmails(updated);
  };

  const addEmailField = () =>
    setEmails([...emails, { value: "", error: "" }]);

  const removeEmailField = (index) => {
    if (emails.length === 1) return;
    setEmails(emails.filter((_, i) => i !== index));
  };

  const validateEmails = () => {
    const updated = emails.map((e) => ({ ...e, value: e.value.trim(), error: "" }));
    let hasError = false;

    updated.forEach((e) => {
      if (!e.value) {
        e.error = "Email is required.";
        hasError = true;
      } else if (!isValidEmail(e.value)) {
        e.error = "Invalid email format.";
        hasError = true;
      }
    });

    const emailValues = updated.map((e) => e.value);
    const duplicates = emailValues.filter(
      (item, index) => emailValues.indexOf(item) !== index && item !== ""
    );
    if (duplicates.length > 0) {
      updated.forEach((e) => {
        if (duplicates.includes(e.value)) e.error = "Duplicate email.";
      });
      hasError = true;
    }

    setEmails(updated);

    if (hasError) {
      const firstErrorIndex = updated.findIndex((e) => e.error);
      if (inputRefs.current[firstErrorIndex]) inputRefs.current[firstErrorIndex].focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmails()) return;

    setLoading(true);
    try {
      const emailList = emails.map((e) => e.value);
      const payload =
        emailList.length === 1
          ? { email: emailList[0], assessmentName: selectedAssessment }
          : { emails: emailList, assessmentName: selectedAssessment };

      const endpoint =
        emailList.length === 1 ? "/api/candidates" : "/api/candidates/bulk";

      await axios.post(endpoint, payload);

      toast.success("✅ Candidate(s) saved successfully!");
      setEmails([{ value: "", error: "" }]);
      if (onAdd) onAdd();
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === emails.length - 1) addEmailField();
      else inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow rounded space-y-4"
    >
      <h6 className="text-xl font-semibold mb-2">Add Candidate Emails</h6>

      {emails.map((emailObj, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              ref={(el) => (inputRefs.current[i] = el)}
              type="email"
              value={emailObj.value}
              onChange={(e) => handleEmailChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              placeholder="user@gmail.com"
              className={`flex-grow px-3 py-2 border rounded-lg focus:outline-none ${
                emailObj.error
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              disabled={loading}
            />
            {emails.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmailField(i)}
                disabled={loading}
                className="text-red-500 hover:text-red-700 text-lg font-bold rounded-lg"
              >
                &times;
              </button>
            )}
          </div>
          {emailObj.error && <p className="text-red-600 text-sm">{emailObj.error}</p>}
        </div>
      ))}

      <button
        type="button"
        onClick={addEmailField}
        disabled={loading}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
      >
        + Add another email
      </button>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Candidate(s)"}
      </button>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </form>
  );
};

export default CandidateFormDynamic;
