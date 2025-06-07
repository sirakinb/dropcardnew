import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { contactService } from '../../services/database';
import ContactCard from '../../components/contacts/ContactCard';

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  const loadContacts = async () => {
    try {
      const result = await contactService.getUserContacts();
      if (result.error) {
        throw new Error(result.error);
      }
      
      const contactsData = result.data || [];
      setContacts(contactsData);
      setFilteredContacts(contactsData);
      
      // Extract all unique tags
      const tags = new Set();
      contactsData.forEach(contact => {
        if (contact.tags && Array.isArray(contact.tags)) {
          contact.tags.forEach(tag => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags));
      
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  // Load contacts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [loadContacts])
  );

  // Filter contacts based on search query and selected tags
  useEffect(() => {
    let filtered = contacts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact => 
        (contact.name || '').toLowerCase().includes(query) ||
        (contact.email || '').toLowerCase().includes(query) ||
        (contact.company || '').toLowerCase().includes(query) ||
        (contact.title || '').toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(contact =>
        contact.tags && selectedTags.some(tag => contact.tags.includes(tag))
      );
    }

    setFilteredContacts(filtered);
  }, [searchQuery, selectedTags, contacts]);

  const handleContactPress = (contact) => {
    // Navigate to contact detail view (will implement later)
    console.log('Contact pressed:', contact.name);
  };

  const handleEditContact = (contact) => {
    navigation.navigate('AddContact', {
      editMode: true,
      contactData: contact
    });
  };

  const handleDeleteContact = (contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete "${contact.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await contactService.deleteContact(contact.id);
              if (result.error) {
                throw new Error(result.error);
              }
              await loadContacts(); // Refresh the list
              Alert.alert('Success', 'Contact deleted successfully');
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', 'Failed to delete contact. Please try again.');
            }
          }
        }
      ]
    );
  };

  const toggleTagFilter = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const handleAddContactPress = () => {
    console.log('Add Contact button pressed');
    try {
      navigation.navigate('AddContact');
      console.log('Navigation to AddContact successful');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const renderContact = ({ item: contact }) => (
    <ContactCard
      contact={contact}
      onPress={handleContactPress}
      onEdit={handleEditContact}
      onDelete={handleDeleteContact}
    />
  );

  const renderTagFilter = ({ item: tag }) => {
    const isSelected = selectedTags.includes(tag);
    return (
      <TouchableOpacity
        style={[styles.tagFilter, isSelected && styles.tagFilterSelected]}
        onPress={() => toggleTagFilter(tag)}
      >
        <Text style={[styles.tagFilterText, isSelected && styles.tagFilterTextSelected]}>
          {tag}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedTags.length > 0 ? 'No matches found' : 'No contacts yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedTags.length > 0 
          ? 'Try adjusting your search or filters' 
          : 'Add your first contact to get started'
        }
      </Text>
      
      {!(searchQuery || selectedTags.length > 0) && (
        <TouchableOpacity 
          style={styles.addContactButton}
          onPress={handleAddContactPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          delayPressIn={0}
        >
          <Text style={styles.addContactButtonText}>Add Contact</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <Text style={styles.subtitle}>
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {(searchQuery || selectedTags.length > 0) && (
            <TouchableOpacity onPress={clearFilters}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <View style={styles.tagsContainer}>
          <FlatList
            horizontal
            data={allTags}
            renderItem={renderTagFilter}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsList}
          />
        </View>
      )}

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContainer,
          filteredContacts.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={filteredContacts.length > 0}
      />

      {/* Add Contact FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddContactPress}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  tagsContainer: {
    paddingBottom: 16,
  },
  tagsList: {
    paddingHorizontal: 24,
    gap: 8,
  },
  tagFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagFilterSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  tagFilterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tagFilterTextSelected: {
    color: '#ffffff',
  },
  listContainer: {
    paddingHorizontal: 24,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  addContactButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  addContactButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 