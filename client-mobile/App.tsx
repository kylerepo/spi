import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/toaster';
import { useProfile } from './hooks/useProfile';
import { View, Text, StyleSheet } from 'react-native';
import { colors, globalStyles } from './styles';
import Toast from 'react-native-toast-message';

// Import pages
import HeroSection from './components/HeroSection';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ProfileSetupPage from './pages/ProfileSetup';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages-not-found';
import IsoPage from './pages/IsoPage';
import Layout from './components/Layout';
import Navigation from './components/Navigation';

const Stack = createStackNavigator();

function MainApp() {
  return (
    <Layout>
      <Navigation />
    </Layout>
  );
}

function AppNavigator() {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>SPICE</Text>
        <Text style={globalStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user && profile ? (
          <Stack.Screen name="Main" component={MainApp} />
        ) : user && !profile ? (
          <Stack.Screen name="ProfileSetup" component={ProfileSetupPage} />
        ) : (
          <>
            <Stack.Screen name="Hero" component={HeroSection} />
            <Stack.Screen name="Login">
              {props => <LoginForm {...props} onLogin={signIn} />}
            </Stack.Screen>
            <Stack.Screen name="Signup">
              {props => <SignupForm {...props} onSignup={signUp} />}
            </Stack.Screen>
          </>
        )}
        <Stack.Screen name="Support" component={Support} />
        <Stack.Screen name="Privacy" component={PrivacyPolicy} />
        <Stack.Screen name="Terms" component={TermsOfService} />
        <Stack.Screen name="Iso" component={IsoPage} />
        <Stack.Screen name="NotFound" component={NotFound} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppNavigator />
          <Toast />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default App;
