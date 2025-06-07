import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../contexts/AuthContext';
import { profileService } from '../../services/database';

export default function SettingsScreen({ navigation }) {
  const authContext = useContext(AuthContext);
  
  // Add safety check for context
  if (!authContext) {
    console.error('SettingsScreen: AuthContext not found');
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Unable to load settings</Text>
          <Text style={styles.errorSubtext}>AuthContext is not available. Please restart the app.</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { user, signOut } = authContext;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    autoBackup: true,
    analytics: false,
  });

  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const result = await profileService.getProfile(user.id);
        if (result.data) {
          setProfile(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Don't crash on error, just continue without profile data
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem('userPreferences');
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences(currentPrefs => ({ ...currentPrefs, ...parsedPreferences }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Continue with default preferences on error
    }
  };

  const savePreferences = async (newPreferences) => {
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              if (signOut && typeof signOut === 'function') {
                await signOut();
              } else {
                throw new Error('Sign out function not available');
              }
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert(
                'Error', 
                'Failed to sign out. Please try restarting the app.',
                [
                  { text: 'OK' },
                  { 
                    text: 'Restart App', 
                    onPress: () => {
                      // In development, user needs to manually restart
                      Alert.alert('Please restart the app manually');
                    }
                  }
                ]
              );
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('CreateCard', {
      editMode: true,
      cardData: profile,
      userName: profile?.full_name,
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Account deletion will be available in a future update.');
          },
        },
      ]
    );
  };

  const togglePreference = async (key) => {
    try {
      const newPreferences = {
        ...preferences,
        [key]: !preferences[key]
      };
      
      setPreferences(newPreferences);
      await savePreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement, showChevron = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={22} color="#6B7280" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (showChevron && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      ))}
    </TouchableOpacity>
  );

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <SettingSection title="Profile">
          <SettingItem
            icon="card-outline"
            title="My Business Cards"
            subtitle="Manage your digital cards"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Cards' })}
          />
          <SettingItem
            icon="people-outline"
            title="My Contacts"
            subtitle="View and manage contacts"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Contacts' })}
          />
        </SettingSection>

        {/* App Preferences */}
        <SettingSection title="Preferences">
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Coming soon"
            rightElement={
              <Switch
                value={false}
                onValueChange={() => {}}
                disabled={true}
                trackColor={{ false: '#E5E7EB', true: '#000000' }}
                thumbColor="#ffffff"
              />
            }
            showChevron={false}
          />
        </SettingSection>

        {/* Data & Privacy */}
        <SettingSection title="Data & Privacy">
          <SettingItem
            icon="download-outline"
            title="Export Data"
            subtitle="Download your information"
            onPress={() => Alert.alert('Feature Coming Soon', 'Data export will be available in a future update.')}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy Policy', 'Our privacy policy protects your data and explains how we use it.')}
          />
        </SettingSection>

        {/* Support */}
        <SettingSection title="Support">
          <SettingItem
            icon="help-circle-outline"
            title="Help & FAQ"
            onPress={() => Alert.alert('Help', 'Visit our support website or contact us at support@dropcard.app')}
          />
          <SettingItem
            icon="mail-outline"
            title="Contact Support"
            onPress={() => Alert.alert('Contact Support', 'Email us at support@dropcard.app for assistance.')}
          />
          <SettingItem
            icon="star-outline"
            title="Rate the App"
            onPress={() => Alert.alert('Rate DropCard', 'Thanks for using DropCard! Please rate us on the App Store.')}
          />
          <SettingItem
            icon="information-circle-outline"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert('About DropCard', 'DropCard v1.0.0\nYour digital business card solution.')}
          />
        </SettingSection>

        {/* Account Actions */}
        <SettingSection title="Account">
          <SettingItem
            icon="log-out-outline"
            title="Sign Out"
            onPress={handleSignOut}
            rightElement={null}
            showChevron={false}
          />
          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
            <Text style={styles.dangerText}>Delete Account</Text>
          </TouchableOpacity>
        </SettingSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerSubtext}>© 2025 Pentridge Labs. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginHorizontal: 24,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 20,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  retryButton: {
    padding: 12,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
}); 