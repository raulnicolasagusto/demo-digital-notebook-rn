import { useForm } from 'react-hook-form'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import CustomInput from './src/components/CustomInput';
import CustomButton from './src/components/CustomButton';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';



const signInSchema = z.object({
  email: z.string({ message: 'El email es obligatorio' }).email('Email inválido').nonempty('El email es obligatorio'),
  password: z.string({ message: 'La contraseña es obligatoria' }).min(8, 'La contraseña debe tener al menos 8 caracteres').nonempty('La contraseña es obligatoria'),
});

//con esta linea podemos agregar el type a la funcion signIn
type SignInField = z.infer<typeof signInSchema>;


export default function SignIn() {

  const { control, handleSubmit, formState: { errors } } = useForm({
    mode: 'onBlur', // Esto hará que la validación se dispare cuando el usuario pierda el foco
    resolver: zodResolver(signInSchema)
  });


  const onSignIn = (data: SignInField) => {
    //Manual validation
    console.log('Sign in', data.email, data.password);
  };

  

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>

      {/* <Text style={styles.title}>Sign in!</Text>
      <TextInput autoComplete='email' keyboardType="email-address" autoCapitalize="none" placeholder="Email" style={styles.input} />
      <TextInput keyboardType="default" autoCapitalize="none" placeholder="Password" style={styles.input} secureTextEntry /> */}

      <Text style={styles.title}> Sign In</Text>

      <View style={styles.form}>
        <CustomInput
        control={control}
        name="email"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email"
        />

        <CustomInput
        control={control}
        name="password"
        autoComplete='password'
        keyboardType="default"
        autoCapitalize="none"
        placeholder="Password"
        secureTextEntry
        />
     </View>

      <CustomButton text="Sign in" onPress={handleSubmit(onSignIn)}/>

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

  form:{
    gap: 5, // Espacio entre los campos del formulario
  },

});



// 52:00