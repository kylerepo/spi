import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, globalStyles } from '../styles';

export default function PrivacyPolicy({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Privacy Policy</Text>
        <Text style={styles.subHeader}>Effective Date: {new Date().toLocaleDateString()}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>1. Introduction</Text>
          <Text style={styles.text}>
            SPICE ("we," "us," "our," or "Company") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our dating and lifestyle platform. By using SPICE, you consent to the data practices described in this policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>2. Information We Collect</Text>
          <Text style={styles.subSectionHeader}>2.1 Information You Provide Directly</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Account Information: Email address, password, phone number, and age verification</Text>
            <Text style={styles.listItem}>• Profile Information: Photos, bio, preferences, lifestyle choices, relationship status</Text>
            <Text style={styles.listItem}>• Identity Verification: Government-issued ID or other verification documents</Text>
            <Text style={styles.listItem}>• Communication Data: Messages, chat history, video calls, and other interactions</Text>
            <Text style={styles.listItem}>• Payment Information: Credit card details, billing address (processed by third-party providers)</Text>
            <Text style={styles.listItem}>• Customer Support: Information provided when contacting support</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...globalStyles.container,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 10,
  },
  subSectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: colors.mutedForeground,
    marginBottom: 10,
  },
  list: {
    marginLeft: 10,
  },
  listItem: {
    fontSize: 16,
    color: colors.mutedForeground,
    marginBottom: 5,
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: colors.secondaryForeground,
    fontWeight: 'bold',
  },
});
