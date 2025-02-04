import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const inviteId = queryParams.get("inviteId");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auths/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.msg || "Login failed. Please try again.");
        return;
      }

      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("token", data.token);

      navigate(inviteId ? `/chat?inviteId=${inviteId}` : "/chat");
    } catch (err) {
      setError("An error occurred while logging in. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Login</h2>
        {error && <div className="text-red-500 text-center mb-4"><p>{error}</p></div>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
