import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, globalStyles } from '../styles';

export default function TermsOfService({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Terms of Service</Text>
        <Text style={styles.subHeader}>Effective Date: {new Date().toLocaleDateString()}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By creating an account or using SPICE ("we," "us," "our," or the "Service"), you ("you" or "user") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use our Service. These Terms constitute a legally binding agreement between you and SPICE.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>2. Eligibility and Age Requirements</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Age Verification:</Text> You must be at least 18 years of age to create an account or use this Service. By using SPICE, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Adult Content:</Text> This platform contains adult content and is designed exclusively for consenting adults seeking lifestyle connections. We may require age verification documentation at our discretion.
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Prohibited Users:</Text> You may not use this Service if you are a registered sex offender or have been convicted of any crime involving violence, sexual misconduct, or crimes against minors.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>3. Account Registration and Security</Text>
          <Text style={styles.text}>
             <Text style={styles.bold}>Account Information:</Text> You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
          </Text>
          <Text style={styles.text}>
             <Text style={styles.bold}>Account Security:</Text> You are responsible for safeguarding your password and all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </Text>
          <Text style={styles.text}>
             <Text style={styles.bold}>One Account Per Person:</Text> You may only maintain one account at a time. Creating multiple accounts may result in suspension of all accounts.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>4. User Conduct and Prohibited Activities</Text>
          <Text style={styles.text}>You agree not to:</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Use the Service for any unlawful purpose or to solicit illegal activities</Text>
            <Text style={styles.listItem}>• Harass, abuse, threaten, or intimidate other users</Text>
            <Text style={styles.listItem}>• Post content that is hateful, discriminatory, or promotes violence</Text>
            <Text style={styles.listItem}>• Share explicit sexual content without explicit consent from all parties</Text>
            <Text style={styles.listItem}>• Impersonate any person or entity or misrepresent your identity</Text>
            <Text style={styles.listItem}>• Use automated scripts, bots, or other automated means to access the Service</Text>
            <Text style={styles.listItem}>• Attempt to gain unauthorized access to our systems or other users' accounts</Text>
            <Text style={styles.listItem}>• Transmit viruses, malware, or other harmful code</Text>
            <Text style={styles.listItem}>• Solicit money, goods, or services from other users</Text>
            <Text style={styles.listItem}>• Use the Service for commercial purposes without our written consent</Text>
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
  text: {
    fontSize: 16,
    color: colors.mutedForeground,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
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
