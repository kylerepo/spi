import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, globalStyles } from '../styles';

export default function Support({ navigation }) {
  const handleContactSupport = () => {
    Linking.openURL('mailto:support@spice-app.com?subject=SPICE Support Request');
  };

  const handleReportIssue = () => {
    Linking.openURL('mailto:support@spice-app.com?subject=Report Issue - SPICE App');
  };

  const supportSections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using SPICE',
      icon: 'help-circle',
      items: [
        'Creating your profile',
        'Setting up preferences',
        'Understanding matching',
        'Safety guidelines',
      ],
    },
    {
      title: 'Safety & Security',
      description: 'Stay safe while exploring connections',
      icon: 'shield',
      items: [
        'Reporting users',
        'Blocking and unmatching',
        'Privacy settings',
        'Meeting safely',
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Support</Text>
        <Text style={styles.subHeader}>Get help and find answers</Text>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Quick Actions</Text>
          <TouchableOpacity style={styles.button} onPress={handleContactSupport}>
            <Feather name="mail" size={20} color={colors.primary} />
            <Text style={styles.buttonText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleReportIssue}>
            <Feather name="alert-triangle" size={20} color={colors.primary} />
            <Text style={styles.buttonText}>Report an Issue</Text>
          </TouchableOpacity>
        </View>

        {supportSections.map((section, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeaderContainer}>
              <Feather name={section.icon} size={24} color={colors.primary} />
              <View>
                <Text style={styles.cardHeader}>{section.title}</Text>
                <Text style={styles.cardSubHeader}>{section.description}</Text>
              </View>
            </View>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity key={itemIndex} style={styles.listItem}>
                <Text style={styles.listItemText}>{item}</Text>
                <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
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
  card: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.foreground,
    marginLeft: 10,
  },
  cardSubHeader: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginLeft: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  buttonText: {
    color: colors.foreground,
    marginLeft: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listItemText: {
    color: colors.mutedForeground,
  },
  backButton: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: colors.secondaryForeground,
    fontWeight: 'bold',
  },
});
