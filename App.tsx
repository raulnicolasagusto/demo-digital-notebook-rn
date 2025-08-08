import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import CustomInput from './src/components/CustomeInput';

export default function App() {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      {/* <Text style={styles.title}>Sign in!</Text>
      <TextInput autoComplete='email' keyboardType="email-address" autoCapitalize="none" placeholder="Email" style={styles.input} />
      <TextInput keyboardType="default" autoCapitalize="none" placeholder="Password" style={styles.input} secureTextEntry /> */}

      <CustomInput autoComplete='email' keyboardType="email-address" autoCapitalize="none" placeholder="Email"/>
      <CustomInput autoComplete='password' keyboardType="default" autoCapitalize="none" placeholder="Password" secureTextEntry/>

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
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
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



