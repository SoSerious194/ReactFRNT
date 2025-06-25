import { USER_ROLES } from "@/lib/constant";
import { login, logout, signup } from "./actions";

export default function LoginPage() {
  return (
    <form className="flex gap-4">
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />

      <label htmlFor="user_role">User Role:</label>
      <select id="user_role" name="user_role">
        <option value={USER_ROLES.CLIENT}>Client</option>
        <option value={USER_ROLES.COACH}>Coach</option>
      </select>

      <div></div>
      <button formAction={login}>Log in</button>
      <button formAction={signup}>Sign up</button>
      <button formAction={logout}>Logout</button>
    </form>
  );
}
