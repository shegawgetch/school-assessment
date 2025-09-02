export default function Dashboard() {
  return (
    <main className="bg-gray-50 min-h-screen p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Invitation Summary Cards */}
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <h4 className="text-lg font-semibold text-gray-700 mb-1">Invitations Sent</h4>
          <p className="text-2xl font-bold text-gray-900">120</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <h4 className="text-lg font-semibold text-gray-700 mb-1">Accepted</h4>
          <p className="text-2xl font-bold text-gray-900">85</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h4 className="text-lg font-semibold text-gray-700 mb-1">Pending</h4>
          <p className="text-2xl font-bold text-gray-900">35</p>
        </div>

        {/* Recent Invitations */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md mt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📬 Recent Invitations</h3>
          <ul className="text-gray-700 space-y-2">
            <li className="flex justify-between border-b pb-2">
              <span>john@example.com</span>
              <span className="text-green-600 font-medium">Accepted</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span>jane@example.com</span>
              <span className="text-yellow-600 font-medium">Pending</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span>alex@example.com</span>
              <span className="text-gray-500 font-medium">Expired</span>
            </li>
          </ul>
        </div>

        {/* Notifications / Admin Notes */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🔔 Admin Notes</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Don't forget to resend pending invites</li>
            <li>Review invitation expiry policy</li>
            <li>Update invitation email content</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
