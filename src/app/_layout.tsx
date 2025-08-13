import { Slot } from "expo-router";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { ThemeProvider } from '../contexts/ThemeContext'

export default function Rootlayout(){
  return (
      <ClerkProvider tokenCache={tokenCache}>
        <ThemeProvider>
          <Slot />
        </ThemeProvider>
      </ClerkProvider>
  );
}