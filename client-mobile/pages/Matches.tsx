import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { colors, globalStyles } from '../styles';
import { Feather } from '@expo/vector-icons';

const mockMatches = [
  { id: '1', name: 'Jessica', lastMessage: 'Hey!', avatar: 'https://placekitten.com/200/200' },
  { id: '2', name: 'Amanda', lastMessage: 'Wanna hang out?', avatar: 'https://placekitten.com/201/200' },
];

const mockLikes = [
  { id: '1', name: 'Sarah', avatar: 'https://placekitten.com/202/200' },
  { id: '2', name: 'Emily', avatar: 'https://placekitten.com/203/200' },
];

const MatchesRoute = () => (
  <FlatList
    data={mockMatches}
    keyExtractor={item => item.id}
    renderItem={({ item }) => (
      <View style={styles.listItem}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.listItemText}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        </View>
        <TouchableOpacity style={styles.chatButton}>
          <Feather name="message-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
    )}
  />
);

const LikesRoute = () => (
  <FlatList
    data={mockLikes}
    keyExtractor={item => item.id}
    renderItem={({ item }) => (
      <View style={styles.listItem}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{item.name}</Text>
      </View>
    )}
  />
);

const renderScene = SceneMap({
  matches: MatchesRoute,
  likes: LikesRoute,
});

export default function Matches() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'matches', title: 'Matches' },
    { key: 'likes', title: 'Who Likes Me' },
  ]);

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: colors.primary }}
            style={{ backgroundColor: colors.background }}
          />
        )}
      />
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  listItemText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  chatButton: {
    padding: 10,
  },
});
