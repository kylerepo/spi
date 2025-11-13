import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-adapter';
import { colors, globalStyles } from '../styles';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

export default function Messages() {
  const { profile } = useProfile();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => api.getMatches(),
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => api.getMessages(selectedConversation.id),
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (newMessage: { text: string }) =>
      api.sendMessage(selectedConversation.id, newMessage.text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation.id] });
    },
  });

  const onSend = (newMessages = []) => {
    sendMessageMutation.mutate(newMessages[0]);
  };

  const giftedChatMessages = messages.map(message => ({
    _id: message.id,
    text: message.content,
    createdAt: new Date(message.created_at),
    user: {
      _id: message.sender_id,
      name: '', // You might want to fetch sender's name
    },
  }));

  if (selectedConversation) {
    return (
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedConversation(null)}>
            <Feather name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedConversation.profile.displayName}</Text>
          <View style={{ width: 24 }} />
        </View>
        <GiftedChat
          messages={giftedChatMessages}
          onSend={onSend}
          user={{
            _id: profile?.id,
          }}
        />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listItem} onPress={() => setSelectedConversation(item)}>
            <Image source={item.profile.photos?.[0] ? { uri: item.profile.photos[0] } : require('../assets/default-avatar.png')} style={styles.avatar} />
            <View style={styles.listItemText}>
              <Text style={styles.name}>{item.profile.displayName}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
