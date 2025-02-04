import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle Login/Register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Only for Register
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [inviteId, setInviteId] = useState(""); // Store invite ID
  const navigate = useNavigate();
  const location = useLocation();

  // Extract inviteId from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const invite = queryParams.get("inviteId");
    if (invite) setInviteId(invite);
  }, [location]);

  // Handle Authentication (Login or Register)
  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const url = isLogin
      ? "https://yourbackend.com/api/auths/login"
      : "https://yourbackend.com/api/auths/register";
      
    const body = isLogin
      ? { email, password }
      : { username, email, password, inviteId }; // Send inviteId if registering

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      if (isLogin) {
        // Login Success
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("token", data.token);
        navigate(inviteId ? `/chat?inviteId=${inviteId}` : "/chat");
      } else {
        // Registration Success
        setSuccessMessage("Registration successful! Redirecting...");
        setTimeout(() => {
          navigate(inviteId ? `/login?inviteId=${inviteId}` : "/login");
        }, 1500);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
          {isLogin ? "Login" : "Register"}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" required />
            </div>
          )}

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

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-gray-600 dark:text-gray-400 text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline cursor-pointer">
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
