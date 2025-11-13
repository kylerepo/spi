import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { colors, globalStyles } from '../styles';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>{children}</View>
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
});
