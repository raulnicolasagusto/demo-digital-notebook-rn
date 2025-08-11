import { useAuth } from '@/providers/AuthProvider';
import { Stack, Slot, Redirect } from 'expo-router';



export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // If the user is authenticated, redirect to the home page or another protected route to avoid showing the auth screens
    return <Redirect href="/" />;
  }

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
}