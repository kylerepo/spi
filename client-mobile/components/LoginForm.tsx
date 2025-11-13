import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, globalStyles } from '../styles';
import AuthLayout from './AuthLayout';
import Input from './ui/Input';
import Button from './ui/Button';

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
    <AuthLayout>
      <View style={styles.formContainer}>
        <Text style={styles.header}>SPICE</Text>
        <LinearGradient
          colors={[colors.primary, '#ff69b4']}
          style={styles.divider}
        />
        <Text style={styles.subHeader}>Welcome Back</Text>
        <Text style={styles.subText}>Sign in to continue your journey</Text>

        <Input
          icon="mail"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <Input
            icon="lock"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Button
          title={isLoading ? 'Signing In...' : 'Sign In'}
          onPress={handleSubmit}
          disabled={isLoading || !email || !password}
        />

        <View style={styles.footer}>
          <TouchableOpacity onPress={onForgotPassword}>
            <Text style={styles.footerText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSignup}>
            <Text style={styles.footerText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
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
