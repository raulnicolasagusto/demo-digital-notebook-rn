import { Slot } from "expo-router";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'

export default function Rootlayout(){
  return (
      <ClerkProvider tokenCache={tokenCache}>
        <Slot />
      </ClerkProvider>
  );
}