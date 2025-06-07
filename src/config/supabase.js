import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://ysoedsoxvsbwztnwrgtp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzb2Vkc294dnNid3p0bndyZ3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDk1OTksImV4cCI6MjA2NDgyNTU5OX0.ShqzHBBkYittlI20s-DSC6Lj8XlqD9GL3_EWbNuN2rQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'dropcard-app/1.0.0',
    },
  },
}); 