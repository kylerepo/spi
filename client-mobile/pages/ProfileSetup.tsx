import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { colors, globalStyles } from '../styles';
import { Feather } from '@expo/vector-icons';

const profileSetupSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  age: z.number().min(18, 'Must be 18 or older'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
});

type ProfileSetupData = z.infer<typeof profileSetupSchema>;

export default function ProfileSetup({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const { control, handleSubmit, formState: { errors } } = useForm<ProfileSetupData>({
    resolver: zodResolver(profileSetupSchema),
  });

  const onSubmit = (data: ProfileSetupData) => {
    console.log(data);
    navigation.navigate('Main');
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Basic Info</Text>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Display Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.displayName && <Text style={styles.error}>{errors.displayName.message}</Text>}
            <Controller
              control={control}
              name="age"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  onBlur={onBlur}
                  onChangeText={value => onChange(parseInt(value, 10))}
                  value={value?.toString()}
                  keyboardType="numeric"
                />
              )}
            />
            {errors.age && <Text style={styles.error}>{errors.age.message}</Text>}
          </View>
        );
      case 2:
        return (
          <View style={styles.step}>
            <Text style={styles.stepTitle}>Introduction</Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Bio"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  multiline
                />
              )}
            />
            {errors.bio && <Text style={styles.error}>{errors.bio.message}</Text>}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Setup</Text>
      </View>
      <ScrollView>
        {renderStep()}
      </ScrollView>
      <View style={styles.nav}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.navButton} onPress={prevStep}>
            <Feather name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        {currentStep < 2 && (
          <TouchableOpacity style={styles.navButton} onPress={nextStep}>
            <Feather name="arrow-right" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        {currentStep === 2 && (
          <TouchableOpacity style={styles.navButton} onPress={handleSubmit(onSubmit)}>
            <Feather name="check" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  step: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.secondary,
    color: colors.foreground,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  textArea: {
    height: 120,
  },
  error: {
    color: colors.destructive,
    marginBottom: 20,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    padding: 10,
  },
});
