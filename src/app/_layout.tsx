import { Slot } from "expo-router";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { ThemeProvider } from '../contexts/ThemeContext'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function Rootlayout(){
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache}>
        <ThemeProvider>
          <Slot />
        </ThemeProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}