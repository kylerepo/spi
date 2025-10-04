
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SignupFormProps {
  onSignup: (userData: {
    email: string;
    password: string;
    name: string;
    age: string;
  }) => void;
  onLogin: () => void;
  isLoading?: boolean;
}

export default function SignupForm({
  onSignup,
  onLogin,
  isLoading = false,
}: SignupFormProps) {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }
    
    if (!agreeToTerms || !agreeToPrivacy) {
      toast({
        title: "Error",
        description: "Please agree to the terms and privacy policy",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(age) < 18) {
      toast({
        title: "Error",
        description: "You must be 18 or older to sign up",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await signUp(email, password, {
        name,
        age: parseInt(age),
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Please check your email to verify your account",
      });
      
      // Auth state change will handle navigation to profile setup
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password && confirmPassword && name && age && 
                     password === confirmPassword && agreeToTerms && agreeToPrivacy && !loading;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image - Same as Hero Section */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/attached_assets/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png)',
          filter: 'blur(2px)',
        }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto p-8 bg-black/70 rounded-2xl border-2 border-pink-500/60 shadow-lg shadow-pink-500/20 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="text-4xl font-bold mb-3"
              style={{ 
                background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 20px rgba(255, 20, 147, 0.5)',
              }}
            >
              SPICE
            </h1>
            <div 
              className="w-16 h-1 mx-auto rounded-full mb-4"
              style={{
                background: 'linear-gradient(90deg, #ff1493, #ff69b4)',
                boxShadow: '0 0 10px rgba(255, 20, 147, 0.8)'
              }}
            />
            <h2 className="text-xl font-semibold mb-2 text-white">Create Account</h2>
            <p className="text-sm text-white/80">
              Join the premium lifestyle community
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-white">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-10 bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  required
                  data-testid="input-name"
                />
              </div>
            </div>

            {/* Age Field */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium text-white">
                Age (18+)
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="99"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="pl-10 bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  required
                  data-testid="input-age"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  required
                  data-testid="input-email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="pl-10 pr-10 bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  required
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-pink-400 hover:text-pink-300"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 bg-black/50 border-pink-500/50 text-white placeholder:text-white/60 focus:border-pink-500"
                  required
                  data-testid="input-confirm-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-pink-400 hover:text-pink-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  data-testid="checkbox-terms"
                  className="border-pink-500/50 mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-white/70 leading-5">
                  I agree to the <span className="text-pink-400">Terms of Service</span> and understand this is an adults-only platform
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={agreeToPrivacy}
                  onCheckedChange={(checked) => setAgreeToPrivacy(checked as boolean)}
                  data-testid="checkbox-privacy"
                  className="border-pink-500/50 mt-1"
                />
                <Label htmlFor="privacy" className="text-sm text-white/70 leading-5">
                  I agree to the <span className="text-pink-400">Privacy Policy</span> and consent to data processing
                </Label>
              </div>
            </div>

            {/* Sign Up Button - Matching Hero Section Style */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-4 px-5 bg-gray-900 text-white font-bold text-lg rounded-full border-3 border-pink-500/50 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/50 animate-glow disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-sign-up"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-pink-500/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-black/70 px-4 text-white/70">Or</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <span className="text-sm text-white/70">Already have an account? </span>
              <Button
                type="button"
                variant="ghost"
                className="p-0 h-auto text-sm text-pink-400 hover:text-pink-300"
                onClick={onLogin}
                data-testid="button-sign-in-link"
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Custom CSS for animations */}
          <style>{`
            @keyframes glow {
              0%, 100% {
                box-shadow: 0 0 8px rgba(255, 20, 147, 0.5);
                border-color: rgba(255, 20, 147, 0.5);
              }
              50% {
                box-shadow: 0 0 16px rgba(255, 20, 147, 1);
                border-color: rgba(255, 20, 147, 1);
              }
            }
            
            .animate-glow {
              animation: glow 2.4s ease-in-out infinite;
            }
          `}</style>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-pink-500/30 text-center">
            <p className="text-xs text-pink-400 mb-2">
              🔞 <strong>Adults Only Platform</strong>
            </p>
            <p className="text-xs text-white/70">
              Premium lifestyle community for 18+ verified members only.
              Your privacy and discretion are our top priorities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
