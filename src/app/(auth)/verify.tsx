import { useForm } from 'react-hook-form'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { useState } from 'react';



const verifySchema = z.object({
  code: z.string({ message: 'El código es obligatorio' }).nonempty('El código es obligatorio').length(6, 'El código debe tener 6 caracteres'),

});

//con esta linea podemos agregar el type a la funcion signIn
type VerifyField = z.infer<typeof verifySchema>;


export default function verifyScreen() {

  const { control, handleSubmit } = useForm<VerifyField>({
    mode: 'onBlur', // Esto hará que la validación se dispare cuando el usuario pierda el foco
    resolver: zodResolver(verifySchema)
  });

  const { signUp, isLoaded, setActive } = useSignUp();
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const onVerify = async (data: VerifyField) => {
    
    if (!isLoaded) return;

    // Limpiar error previo
    setVerificationError(null);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code: data.code });
      if (signUpAttempt.status === 'complete') {
        // Verification was successful, redirect to the home page or wherever you want
        setActive({ session: signUpAttempt.createdSessionId });
      } else {
        console.log('Verification failed', signUpAttempt);
        setVerificationError('Código de verificación inválido. Inténtalo de nuevo.');
      }
    } catch (error: any) {
      console.log('Verification error:', error);
      // Manejar diferentes tipos de errores
      if (error.errors && error.errors[0]) {
        setVerificationError(error.errors[0].message || 'Código de verificación inválido');
      } else {
        setVerificationError('Error al verificar el código. Inténtalo de nuevo.');
      }
    }
   
  };

 

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>

      {/* <Text style={styles.title}>Sign in!</Text>
      <TextInput autoComplete='email' keyboardType="email-address" autoCapitalize="none" placeholder="Email" style={styles.input} />
      <TextInput keyboardType="default" autoCapitalize="none" placeholder="Password" style={styles.input} secureTextEntry /> */}

      <Text style={styles.title}> Verifica tu email</Text>

      <View style={styles.form}>
        <CustomInput
          control={control}
          name="code"
          keyboardType="number-pad"
          autoCapitalize="none"
          placeholder="123456"
          autoFocus
          autoComplete='one-time-code'
        />

     </View>

      <CustomButton text="Verificar" onPress={handleSubmit(onVerify)}/>

      {verificationError && <Text style={styles.error}>El código es incorrecto, ingrese el código correcto</Text>}

      <Link style={styles.link} href="/sign-in"> Ya tienes cuenta? Inicia sesión</Link>

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
  },

  error: {
    color: 'crimson',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  }

});

// 2:48:00