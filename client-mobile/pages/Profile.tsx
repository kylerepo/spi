import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-adapter';
import { colors, globalStyles } from '../styles';
import { Feather } from '@expo/vector-icons';

export default function Profile() {
  const [selectedSection, setSelectedSection] = useState('profile');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getCurrentProfile(),
  });

  const renderSection = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={globalStyles.text}>Loading profile...</Text>
        </View>
      );
    }

    if (!profile) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={globalStyles.text}>Profile not found.</Text>
        </View>
      );
    }

    switch (selectedSection) {
      case 'profile':
        return <ProfileSection profile={profile} />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <ProfileSection profile={profile} />;
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView>
        {renderSection()}
      </ScrollView>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.navButton} onPress={() => setSelectedSection('profile')}>
          <Feather name="user" size={24} color={selectedSection === 'profile' ? colors.primary : colors.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setSelectedSection('settings')}>
          <Feather name="settings" size={24} color={selectedSection === 'settings' ? colors.primary : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ProfileSection = ({ profile }) => (
  <View style={styles.section}>
    <View style={styles.profileHeader}>
      <Image source={profile.photos?.[0] ? { uri: profile.photos[0] } : require('../assets/default-avatar.png')} style={styles.avatar} />
      <Text style={styles.name}>{profile.displayName}, {profile.age}</Text>
      <Text style={styles.location}>{profile.location}</Text>
    </View>
    <View style={styles.photos}>
      {(profile.photos || []).map((photo, index) => (
        <Image key={index} source={{ uri: photo }} style={styles.photo} />
      ))}
    </View>
    <View style={styles.bio}>
      <Text style={styles.bioText}>{profile.bio}</Text>
    </View>
    <View style={styles.interests}>
      {(profile.interests || []).map((interest, index) => (
        <View key={index} style={styles.interest}>
          <Text style={styles.interestText}>{interest}</Text>
        </View>
      ))}
    </View>
  </View>
);

const SettingsSection = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Settings</Text>
    {/* Add settings options here */}
  </View>
);

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.foreground,
    marginTop: 10,
  },
  location: {
    fontSize: 16,
    color: colors.mutedForeground,
  },
  photos: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  bio: {
    marginTop: 20,
  },
  bioText: {
    fontSize: 16,
    color: colors.foreground,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  interest: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
  interestText: {
    color: colors.secondaryForeground,
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
