import { useState } from "react";
import LoginForm from '../LoginForm';

export default function LoginFormExample() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (email: string, password: string) => {
    console.log(`Login with email: ${email}, password: [REDACTED]`);
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login completed');
    }, 2000);
  };

  const handleSignup = () => {
    console.log('Navigate to signup');
  };

  const handleForgotPassword = () => {
    console.log('Navigate to forgot password');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <LoginForm
        onLogin={handleLogin}
        onSignup={handleSignup}
        onForgotPassword={handleForgotPassword}
        isLoading={isLoading}
      />
    </div>
  );
}