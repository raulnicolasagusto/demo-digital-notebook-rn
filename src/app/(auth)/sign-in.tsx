import { useForm } from 'react-hook-form'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';
import SignInWith from '@/components/SignInWith';




const signInSchema = z.object({
  email: z.string({ message: 'El email es obligatorio' }).email('Email inválido').nonempty('El email es obligatorio'),
  password: z.string({ message: 'La contraseña es obligatoria' }).min(8, 'La contraseña debe tener al menos 8 caracteres').nonempty('La contraseña es obligatoria'),
});

//con esta linea podemos agregar el type a la funcion signIn
type SignInField = z.infer<typeof signInSchema>;

const clerkErrorToFormField = {
  'identifier': 'email',
  'password': 'password'
}


export default function SignIn() {

  const { control, handleSubmit, formState: { errors }, setError } = useForm({
    mode: 'onBlur', // Esto hará que la validación se dispare cuando el usuario pierda el foco
    resolver: zodResolver(signInSchema)
  });



  const { signIn, isLoaded, setActive } = useSignIn();

  const onSignIn = async (data: SignInField) => {
    //Manual validation
    if(!isLoaded) return;

      try{

        const signInAttempt = await signIn.create({identifier: data.email, password: data.password});

        if (signInAttempt.status === 'complete') {
          // Sign in was successful, redirect to the home page or wherever you want
          setActive({ session: signInAttempt.createdSessionId });
        }else{
          console.log('Sign in failed', signInAttempt);
          }

        }catch (error) {
          console.log('Error signing in', error);
         if (isClerkAPIResponseError(error)) {
             // Traducir mensajes específicos de Clerk al español
             const errorCode = error.errors[0]?.code;
             const paramName = error.errors[0]?.meta?.paramName || 'identifier';
             
             let spanishMessage = '';
             
             switch (errorCode) {
               case 'form_identifier_not_found':
                 spanishMessage = 'Email no encontrado. Verifica tu dirección de correo.';
                 break;
               case 'form_password_incorrect':
                 spanishMessage = 'Contraseña incorrecta. Inténtalo de nuevo.';
                 break;
               case 'form_identifier_exists':
                 spanishMessage = 'Este email ya está registrado.';
                 break;
               default:
                 spanishMessage = error.errors[0]?.longMessage || 'Error de autenticación.';
             }
             
             const fieldName = clerkErrorToFormField[paramName as keyof typeof clerkErrorToFormField] || 'email';
             setError(fieldName as 'email' | 'password', { message: spanishMessage });
         } else {
             setError('email', { message: 'Algo salió mal. Inténtalo de nuevo.' });
         }
        }
    

    
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

      <Link style={styles.link} href="/sign-up"> No tienes cuenta? Registrate</Link>

      <SignInWith />

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

  link:{
    marginVertical: 10,
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '600',
  }

});

