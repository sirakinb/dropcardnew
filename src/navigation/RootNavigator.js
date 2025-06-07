import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main app screens
import OnboardingScreen from '../screens/OnboardingScreen';
import CreateCardScreen from '../screens/main/CreateCardScreen';
import CardDisplayScreen from '../screens/main/CardDisplayScreen';
import AddContactScreen from '../screens/main/AddContactScreen';
import ContactDetailScreen from '../screens/main/ContactDetailScreen';
import MainTabs from './MainTabs';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [checkingFirstTime, setCheckingFirstTime] = useState(true);

  useEffect(() => {
    checkFirstTimeUser();
  }, [user]);

  const checkFirstTimeUser = async () => {
    if (!user) {
      setCheckingFirstTime(false);
      return;
    }

    try {
      // Check if user has completed onboarding
      const hasCompletedOnboarding = await AsyncStorage.getItem(`onboarding_completed_${user.id}`);
      setIsFirstTime(!hasCompletedOnboarding);
    } catch (error) {
      console.error('Error checking first time user:', error);
      setIsFirstTime(false); // Default to not first time if error
    } finally {
      setCheckingFirstTime(false);
    }
  };

  if (loading || checkingFirstTime) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is signed in
        <>
          {isFirstTime ? (
            // First time user - show onboarding flow first
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : null}
          {/* Main app screens available to all authenticated users */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="CreateCard" component={CreateCardScreen} />
          <Stack.Screen name="CardDisplay" component={CardDisplayScreen} />
          <Stack.Screen name="AddContact" component={AddContactScreen} />
          <Stack.Screen name="ContactDetail" component={ContactDetailScreen} />
        </>
      ) : (
        // User is not signed in - show auth flow
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
} 