import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

export default function TestPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Fetch test from backend
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axios.get(`http://localhost:8083/tests/${token}`);
        setTest(res.data);
        toast.success("Test loaded successfully!", {
          icon: <CheckCircleIcon className="w-5 h-5 text-white" />,
        });
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load test";
        setError(msg);
        toast.error(msg, { icon: <XCircleIcon className="w-5 h-5 text-white" /> });
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [token]);

  // Silent Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!test || Object.keys(answers).length === 0) return;
      try {
        await axios.post(`http://localhost:8083/tests/${token}/autosave`, { answers });
      } catch (err) {
        console.log("Auto-save failed", err);
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [answers, test, token]);

  const handleChange = (qId, value, multi = false) => {
    if (multi) {
      const prev = answers[qId] || [];
      if (prev.includes(value)) {
        setAnswers({ ...answers, [qId]: prev.filter(v => v !== value) });
      } else {
        setAnswers({ ...answers, [qId]: [...prev, value] });
      }
    } else {
      setAnswers({ ...answers, [qId]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`http://localhost:8083/tests/${token}/submit`, { answers });
      toast.success("Assessment submitted successfully!", { icon: "✅" });
      navigate(`/completion/${token}`);
    } catch (err) {
      toast.error("Failed to submit assessment!", { icon: "❌" });
    }
  };

  if (loading) return <p>Loading test...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!test) return null;

  const question = test.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      {/* Stepper */}
      <div className="flex mb-6 justify-between">
        {test.questions.map((q, idx) => (
          <div
            key={q.id}
            className={`flex-1 h-2 mx-1 rounded-full ${
              idx === currentQuestion
                ? "bg-blue-600"
                : idx < currentQuestion
                ? "bg-green-400"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <h1 className="text-2xl font-bold mb-4">{test.title}</h1>

      <div className="p-4 bg-gray-50 rounded-lg shadow-sm mb-6">
        <p className="font-medium text-gray-800">
          Q{currentQuestion + 1}: {question.question}
        </p>

        {/* Dynamic input based on question type */}
        {question.type === "mcq" ? (
          <div className="mt-2">
            {question.options.map((opt, idx) => (
              <label
                key={idx}
                className="block p-2 border rounded mb-2 cursor-pointer hover:bg-gray-100"
              >
                <input
                  type={question.multi ? "checkbox" : "radio"}
                  name={`q-${currentQuestion}`}
                  value={opt}
                  checked={
                    question.multi
                      ? answers[question.id]?.includes(opt)
                      : answers[question.id] === opt
                  }
                  onChange={() => handleChange(question.id, opt, question.multi)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>
        ) : (
          <textarea
            className="mt-2 w-full p-2 border rounded-md"
            rows={4}
            value={answers[question.id] || ""}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder="Write your answer here..."
          />
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(prev - 1, 0))}
          disabled={currentQuestion === 0}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          Previous
        </button>
        {currentQuestion < test.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(prev + 1, test.questions.length - 1))}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Submit Assessment
          </button>
        )}
      </div>
    </div>
  );
}
