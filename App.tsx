import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Pressable, KeyboardAvoidingView, Platform } from 'react-native';

export default function App() {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Text style={styles.title}>Sign in!</Text>
      <TextInput autoComplete='email' keyboardType="email-address" autoCapitalize="none" placeholder="Email" style={styles.input} />
      <TextInput keyboardType="default" autoCapitalize="none" placeholder="Password" style={styles.input} secureTextEntry />

      <Pressable style={styles.button} onPress={() => {console.log('Sign in pressed')}}>
        <Text style={styles.buttonText}>Sign in</Text>
      </Pressable>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});



