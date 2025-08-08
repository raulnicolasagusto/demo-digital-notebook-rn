import {  Text, Pressable, StyleSheet, PressableProps } from 'react-native'

type CustomButtonProps = {
  text: string,
} & PressableProps

export default function CustomButton( {text, ...pressableProps}: CustomButtonProps) {
  return (
          <Pressable {...pressableProps} style={styles.button}>
            <Text style={styles.buttonText}>{text}</Text>
          </Pressable>
  )
}

const styles = StyleSheet.create({
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

