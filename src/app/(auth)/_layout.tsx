import { useAuth } from '@clerk/clerk-expo';
import { Stack, Slot, Redirect } from 'expo-router';



export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    // If the user is signed in, redirect to the home page or another protected route to avoid showing the auth screens
    return <Redirect href="/" />;
  }

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
}