import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-adapter';
import { colors, globalStyles } from '../styles';
import { Feather } from '@expo/vector-icons';

const MatchesRoute = ({ navigation }) => {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => api.getMatches(),
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={globalStyles.text}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={matches}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => navigation.navigate('Messages', { matchId: item.id })}
        >
          <Image source={item.profile.photos?.[0] ? { uri: item.profile.photos[0] } : require('../assets/default-avatar.png')} style={styles.avatar} />
          <View style={styles.listItemText}>
            <Text style={styles.name}>{item.profile.displayName}</Text>
          </View>
          <Feather name="chevron-right" size={24} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    />
  );
};

const LikesRoute = () => (
  <View style={styles.loadingContainer}>
    <Text style={globalStyles.text}>Coming soon...</Text>
  </View>
);

export default function Matches({ navigation }) {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'matches', title: 'Matches' },
    { key: 'likes', title: 'Who Likes Me' },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'matches':
        return <MatchesRoute navigation={navigation} />;
      case 'likes':
        return <LikesRoute />;
      default:
        return null;
    }
  };

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});
