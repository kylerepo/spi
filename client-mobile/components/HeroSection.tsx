import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, globalStyles } from '../styles';

export default function HeroSection({ navigation }) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ImageBackground
      source={{ uri: 'https://placekitten.com/800/1200' }} // Replace with your background image
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.header}>SPICE</Text>
        <LinearGradient
          colors={[colors.primary, '#ff69b4']}
          style={styles.divider}
        />
        <Text style={styles.subHeader}>Start your dating journey today</Text>
        <Text style={styles.subText}>
          Join thousands of adventurous singles and couples exploring connections in a safe, premium environment.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>⚠️ Adults Only Platform</Text>
          <Text style={styles.disclaimerSubText}>
            Premium lifestyle community for 18+ verified members only. Your privacy and discretion are our top priorities.
          </Text>
        </View>
      </Animated.View>
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
  header: {
    fontSize: 60,
    fontWeight: 'bold',
    color: colors.primary,
    textShadowColor: 'rgba(255, 20, 147, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    marginBottom: 10,
  },
  divider: {
    height: 4,
    width: 100,
    borderRadius: 2,
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 20,
  },
  subText: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    padding: 20,
    backgroundColor: colors.secondary,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: colors.secondaryForeground,
    fontWeight: 'bold',
    fontSize: 18,
  },
  disclaimer: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  disclaimerSubText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
