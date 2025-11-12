import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Image, TouchableOpacity } from 'react-native';
import { colors, globalStyles } from '../styles';
import { Feather } from '@expo/vector-icons';

const mockUsers = [
  { id: '1', name: 'Jessica', age: 25, avatar: 'https://placekitten.com/200/200' },
  { id: '2', name: 'Amanda', age: 28, avatar: 'https://placekitten.com/201/200' },
  { id: '3', name: 'Sarah', age: 22, avatar: 'https://placekitten.com/202/200' },
];

const mockEvents = [
  { id: '1', title: 'Beach Party', date: 'Aug 15', image: 'https://placekitten.com/300/200' },
  { id: '2', title: 'Rooftop Mixer', date: 'Aug 22', image: 'https://placekitten.com/301/200' },
];

const mockIsoPosts = [
  { id: '1', title: 'Looking for a +1 for a wedding', author: 'Jessica' },
  { id: '2', title: 'Anyone want to go hiking?', author: 'Amanda' },
];

export default function Community() {
  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users Online</Text>
          <FlatList
            data={mockUsers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
                <Text style={styles.userName}>{item.name}, {item.age}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events</Text>
          <FlatList
            data={mockEvents}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.eventCard}>
                <Image source={{ uri: item.image }} style={styles.eventImage} />
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDate}>{item.date}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ISO Posts</Text>
          {mockIsoPosts.map(post => (
            <View key={post.id} style={styles.isoPost}>
              <Text style={styles.isoTitle}>{post.title}</Text>
              <Text style={styles.isoAuthor}>by {post.author}</Text>
            </View>
          ))}
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
  eventCard: {
    marginRight: 20,
  },
  eventImage: {
    width: 200,
    height: 120,
    borderRadius: 10,
  },
  eventTitle: {
    marginTop: 10,
    color: colors.foreground,
    fontWeight: 'bold',
  },
  eventDate: {
    color: colors.mutedForeground,
  },
  isoPost: {
    backgroundColor: colors.secondary,
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  isoTitle: {
    color: colors.foreground,
    fontWeight: 'bold',
  },
  isoAuthor: {
    color: colors.mutedForeground,
  },
});
