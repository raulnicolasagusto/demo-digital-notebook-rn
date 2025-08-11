import { View, Text } from 'react-native';
import { Link } from 'expo-router';


export default function HomeScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '600' }}>Home Screen</Text>

            <Text style={{ fontSize: 24, fontWeight: '600' }}>si estas logueado ves esta pantalla</Text>

            
        </View>
    );
}
