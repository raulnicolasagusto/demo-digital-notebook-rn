import { StatusBar } from 'expo-status-bar';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import CustomInput from './src/components/CustomInput';
import CustomButton from './src/components/CustomButton';

export default function App() {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>

      {/* <Text style={styles.title}>Sign in!</Text>
      <TextInput autoComplete='email' keyboardType="email-address" autoCapitalize="none" placeholder="Email" style={styles.input} />
      <TextInput keyboardType="default" autoCapitalize="none" placeholder="Password" style={styles.input} secureTextEntry /> */}

      <CustomInput autoComplete='email' keyboardType="email-address" autoCapitalize="none" placeholder="Email"/>
      <CustomInput autoComplete='password' keyboardType="default" autoCapitalize="none" placeholder="Password" secureTextEntry/>

      <CustomButton text="Sign in" onPress={() => {console.log('Sign in pressed')}}/>

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



