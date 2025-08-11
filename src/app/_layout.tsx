import { Slot, Stack } from "expo-router";

export default function Rootlayout(){
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(protected)" options={{ headerShown: false }} />
    </Stack>
  );  
}