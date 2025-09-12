import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useEffect } from "react";

export default function CompletionPage() {
  const { token } = useParams();

  useEffect(() => {
    toast.success("Assessment completed successfully!", { icon: <CheckCircleIcon className="w-5 h-5 text-white" /> });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Assessment Completed!</h1>
        <p className="mb-6">Thank you for completing your assessment. Your responses have been submitted successfully.</p>
      </div>
    </div>
  );
}
