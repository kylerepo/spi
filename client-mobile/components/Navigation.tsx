import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { colors } from '../styles';

import Community from '../pages/Community';
import Matches from '../pages/Matches';
import Browse from '../pages/Browse';
import Messages from '../pages/Messages';
import Profile from '../pages/Profile';

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Community') {
            iconName = 'users';
          } else if (route.name === 'Matches') {
            iconName = 'heart';
          } else if (route.name === 'Browse') {
            iconName = 'search';
          } else if (route.name === 'Messages') {
            iconName = 'message-circle';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Community" component={Community} />
      <Tab.Screen name="Matches" component={Matches} />
      <Tab.Screen name="Browse" component={Browse} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
