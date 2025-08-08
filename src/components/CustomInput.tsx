import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native'


type CustomInputProps = {
    //custome fields
    
} & TextInputProps;

export default function CustomeInput(props: CustomInputProps) {
  //poniendo el style despues del props, y agregando al style props.style, podemos con esto, agregar estilos por fuera , es decir dentro del custominput por ej: <CustomInput style{{borderColor:'red'}}/>
  return <TextInput {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 8,
  },
})


