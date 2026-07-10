import React from "react";
import "../styles/SignUp.css";

const SignUpPage: React.FC = () => {
  return (
    <div className="signup-container">
      <h2>Signup Page</h2>
      <form className="signup-form">
        <input type="text" placeholder="Username" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpPage;
