import React from 'react';
import { View, StyleSheet } from 'react-native';
import Navigation from './Navigation';
import { globalStyles } from '../styles';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <View style={styles.container}>
      {showNav ? <Navigation /> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
  },
});
