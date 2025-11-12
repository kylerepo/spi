import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { colors, globalStyles } from '../styles';

// Mock data - replace with actual API call
const mockProfiles = [
  { id: '1', name: 'Jessica, 25', distance: '5 miles away', image: 'https://placekitten.com/800/1200' },
  { id: '2', name: 'Amanda, 28', distance: '2 miles away', image: 'https://placekitten.com/801/1200' },
  { id: '3', name: 'Sarah, 22', distance: '10 miles away', image: 'https://placekitten.com/802/1200' },
];

export default function Browse() {
  const [showFilters, setShowFilters] = useState(false);
  const swiperRef = useRef(null);

  // const { data: profiles = [], isLoading } = useQuery({
  //   queryKey: ['/api/browse/profiles'],
  //   queryFn: () => apiRequest('/api/browse/profiles'),
  // });
  const profiles = mockProfiles;
  const isLoading = false;

  const renderCard = (card, index) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: card.image }} style={styles.cardImage} />
        <View style={styles.cardOverlay}>
          <Text style={styles.cardName}>{card.name}</Text>
          <Text style={styles.cardDistance}>{card.distance}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Feather name="filter" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <ScrollView style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filters</Text>
          {/* Add filter options here */}
        </ScrollView>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={globalStyles.text}>Finding profiles for you...</Text>
        </View>
      ) : (
        <Swiper
          ref={swiperRef}
          cards={profiles}
          renderCard={renderCard}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={3}
          infinite
          showSecondCard
          animateCardOpacity
          onSwipedLeft={() => console.log('swiped left')}
          onSwipedRight={() => console.log('swiped right')}
          overlayLabels={{
            left: {
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: colors.destructive,
                  borderColor: colors.destructive,
                  color: 'white',
                  borderWidth: 1,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                },
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  color: 'white',
                  borderWidth: 1,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                },
              },
            },
          }}
        />
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => swiperRef.current.swipeLeft()}>
          <Feather name="x" size={32} color={colors.destructive} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => swiperRef.current.swipeRight()}>
          <Feather name="heart" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>
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
  filtersContainer: {
    padding: 20,
  },
  filtersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  cardDistance: {
    fontSize: 18,
    color: 'white',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});
