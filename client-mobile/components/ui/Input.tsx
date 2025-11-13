import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../styles';

interface InputProps extends TextInputProps {
  icon?: keyof typeof Feather.glyphMap;
}

export default function Input({ icon, ...props }: InputProps) {
  return (
    <View style={styles.inputContainer}>
      {icon && <Feather name={icon} size={20} color={colors.primary} style={styles.icon} />}
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
