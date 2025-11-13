import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-adapter';
import { colors, globalStyles } from '../styles';

export default function Community() {
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['browseProfiles'],
    queryFn: () => api.getBrowseProfiles(),
  });

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users Online</Text>
          {usersLoading ? (
            <Text style={globalStyles.text}>Loading users...</Text>
          ) : (
            <FlatList
              data={users}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.userId}
              renderItem={({ item }) => (
                <View style={styles.userCard}>
                  <Image source={item.photos?.[0] ? { uri: item.photos[0] } : require('../assets/default-avatar.png')} style={styles.userAvatar} />
                  <Text style={styles.userName}>{item.displayName}, {item.age}</Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 20,
  },
  userCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    marginTop: 10,
    color: colors.foreground,
  },
});
