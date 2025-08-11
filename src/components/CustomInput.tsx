import { Controller } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native'


type CustomInputProps = {
    //custome fields
    control: any;
    name: string;
    rules?: any;
} & TextInputProps;

export default function CustomInput({ control, name, rules = {}, ...props }: CustomInputProps) {
  //poniendo el style despues del props, y agregando al style props.style, podemos con esto, agregar estilos por fuera , es decir dentro del custominput por ej: <CustomInput style{{borderColor:'red'}}/>
  
  // Reglas por defecto si no se proporcionan
  const defaultRules = {
    required: 'Este campo es obligatorio',
    ...rules
  };

return (
    <Controller
       control={control}
       name={name}
       render={({ field: { onChange, onBlur, value }, fieldState:{error} }) => (
        <View style={styles.container}>
          <TextInput
            {...props}
            style={[styles.input, props.style, error && styles.inputError]}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
          <Text style={styles.error}>{error?.message}</Text>
        </View>
      )}
    />
    
  )
}

const styles = StyleSheet.create({
  container:{
    gap:2,
  },

  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 8,
  },
  inputError: {
    borderColor: 'crimson',
    borderWidth: 1,
  },
  error: {
    color: 'crimson',
    fontSize: 12,
    marginBottom: 4,
  },
})


