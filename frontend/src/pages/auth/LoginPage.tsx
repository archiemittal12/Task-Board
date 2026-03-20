import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-form">
      <h2>Welcome Back 👋</h2>

      <input placeholder="Email" />
      <input placeholder="Password" type="password" />

      <button onClick={() => navigate("/dashboard")}>
        Login
      </button>

      <p onClick={() => navigate("/register")}>
        Don't have an account? Register
      </p>
    </div>
  );
}