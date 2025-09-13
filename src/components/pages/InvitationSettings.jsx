import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function InvitationSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [selectedExam, setSelectedExam] = useState("");
  const [errors, setErrors] = useState({}); // field-level errors

  // Settings state
  const [settings, setSettings] = useState({
    reminderTimeHours: 24,
    expirationDays: 7,
    sendReminder: true,
    sendEmailNotification: true,
  });

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8083/invitation-settings");
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      toast.error("Failed to fetch invitation settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Validation helper
  const validateForm = () => {
    let newErrors = {};

    if (!selectedExam) {
      newErrors.exam = "Please select an exam.";
    }
    if (!settings.reminderTimeHours || settings.reminderTimeHours < 1) {
      newErrors.reminderTimeHours = "Reminder time must be at least 1 hour.";
    }
    if (!settings.expirationDays || settings.expirationDays < 1) {
      newErrors.expirationDays = "Expiration must be at least 1 day.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save settings
  const saveSettings = async () => {
    if (!validateForm()) {
      toast.warn("Fix the errors before saving.");
      return;
    }
    try {
      setSaving(true);
      await axios.post("http://localhost:8083/invitation-settings", {
        ...settings,
        exam: selectedExam,
      });
      toast.success("Invitation settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // Generate Invitations
  const generateInvites = async () => {
    if (!validateForm()) {
      toast.warn("Fix the errors before generating.");
      return;
    }
    try {
      setGenerating(true);
      const res = await axios.post("http://localhost:8083/invitations/bulk", {
        exam: selectedExam,
        ...settings,
      });
      toast.success(
        `Invitations generated for ${res.data.invitations?.length || 0} candidates!`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate invites.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <h2 className="text-2xl font-semibold text-gray-800">
        Invitation Settings
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading settings...</p>
      ) : (
        <div className="bg-white p-6 rounded shadow-md space-y-4 border border-gray-200">
          {/* Exam Selection */}
          <div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <label className="w-48 font-medium text-gray-700">Select Exam</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className={`flex-1 border rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 
                  ${errors.exam ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Choose Exam</option>
                <option value="Assessment A">Assessment A</option>
                <option value="Assessment B">Assessment B</option>
              </select>
            </div>
            {errors.exam && <p className="text-red-500 text-sm mt-1">{errors.exam}</p>}
          </div>

          {/* Reminder Time */}
          <div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <label className="w-48 font-medium text-gray-700">
                Reminder Time (hours)
              </label>
              <input
                type="number"
                min={1}
                value={settings.reminderTimeHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reminderTimeHours: Number(e.target.value),
                  })
                }
                className={`flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 
                  ${errors.reminderTimeHours ? "border-red-500" : "border-gray-300"}`}
              />
            </div>
            {errors.reminderTimeHours && (
              <p className="text-red-500 text-sm mt-1">{errors.reminderTimeHours}</p>
            )}
          </div>

          {/* Expiration Days */}
          <div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <label className="w-48 font-medium text-gray-700">
                Expiration (days)
              </label>
              <input
                type="number"
                min={1}
                value={settings.expirationDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    expirationDays: Number(e.target.value),
                  })
                }
                className={`flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 
                  ${errors.expirationDays ? "border-red-500" : "border-gray-300"}`}
              />
            </div>
            {errors.expirationDays && (
              <p className="text-red-500 text-sm mt-1">{errors.expirationDays}</p>
            )}
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={settings.sendReminder}
              onChange={(e) =>
                setSettings({ ...settings, sendReminder: e.target.checked })
              }
              className="h-5 w-5 text-blue-600 border-gray-300 rounded"
            />
            <label className="font-medium text-gray-700">Enable Reminders</label>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={settings.sendEmailNotification}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sendEmailNotification: e.target.checked,
                })
              }
              className="h-5 w-5 text-blue-600 border-gray-300 rounded"
            />
            <label className="font-medium text-gray-700">
              Enable Email Notification
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <button
              onClick={generateInvites}
              disabled={generating}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {generating ? "Generating..." : "Generate Invitations"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
