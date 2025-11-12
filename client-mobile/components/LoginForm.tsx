import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, globalStyles } from '../styles';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSignup: () => void;
  onForgotPassword: () => void;
  isLoading?: boolean;
}

export default function LoginForm({
  onLogin,
  onSignup,
  onForgotPassword,
  isLoading = false,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    onLogin(email, password);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://placekitten.com/800/1200' }} // Replace with your background image
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.header}>SPICE</Text>
          <LinearGradient
            colors={[colors.primary, '#ff69b4']}
            style={styles.divider}
          />
          <Text style={styles.subHeader}>Welcome Back</Text>
          <Text style={styles.subText}>Sign in to continue your journey</Text>

          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color={colors.primary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color={colors.primary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, (isLoading || !email || !password) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading || !email || !password}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onForgotPassword}>
              <Text style={styles.footerText}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSignup}>
              <Text style={styles.footerText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    ...globalStyles.container,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  header: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 4,
    width: 60,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    padding: 10,
  },
  input: {
    flex: 1,
    color: colors.foreground,
    padding: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.secondaryForeground,
    fontWeight: 'bold',
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  footerText: {
    color: colors.primary,
  },
});
