import { getUserRole } from "@/lib/roles";
import { getUser, logout } from "./login/actions";

export default async function Home() {
  const user = await getUser();
  const userRole = await getUserRole();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {user && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-3">User Details</h2>
            <div className="space-y-2">
              <p>
                <span className="text-gray-600">Email:</span> {user?.user?.email || "Not available"}
              </p>
              <p>
                <span className="text-gray-600">Role:</span> {userRole || "Not assigned"}
              </p>
            </div>
          </div>
        )}

        {user && (
          <button onClick={logout} className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
