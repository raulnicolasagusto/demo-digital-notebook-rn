import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';


export default function HomeScreen() {
    const { user } = useUser();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '600' }}>Home Screen</Text>

            <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 20, color: '#007BFF' }}>
                Hola {user?.emailAddresses[0]?.emailAddress}
            </Text>

            <Text style={{ fontSize: 16, fontWeight: '400', marginTop: 10 }}>
                Si estás logueado ves esta pantalla
            </Text>

            
        </View>
    );
}
