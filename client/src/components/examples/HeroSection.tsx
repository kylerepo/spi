import HeroSection from '../HeroSection';

export default function HeroSectionExample() {
  const handleSignIn = () => {
    console.log('Sign in clicked');
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
  };

  return (
    <HeroSection 
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
    />
  );
}