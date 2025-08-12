import { View, Text, StyleSheet, Button} from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo';

export default function WelcomeScreen() {

  const { signOut, isSignedIn } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la app!</Text>

      <Text>{isSignedIn ? "Estás autenticado" : "No estás autenticado"}</Text>
      <Button title='Sign out' onPress={() => signOut()} />

      <Link style={styles.link} href="/sign-in"> Go to Sign In</Link>
      <Link style={styles.link} href="/sign-up"> Go to Sign Up</Link>
      <Link style={styles.link} href="/(protected)">Ir a protected</Link>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  link: {
    fontSize: 16,
    color: '#007BFF',
    marginVertical: 10,
  },
})
