import { createContext, PropsWithChildren, useState, useContext, useEffect } from 'react';
import { ActivityIndicator, View} from 'react-native';


const AuthContext = createContext({

    isAuthenticated: false,
    signIn: () => {},
    signOut: () => {}
});

export const AuthProvider = ({ children }: PropsWithChildren) => {

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        // Simulate an async authentication check
        const checkAuth = async () => {
            // Here you would typically check the user's auth status
            await new Promise(resolve => setTimeout(resolve, 500));
            setIsAuthenticated(true);
        };

        checkAuth();
    }, []);

    const signIn = () => {
        setIsAuthenticated(true);
    }

    const signOut = () => {
        setIsAuthenticated(false); 
    }

    if (isAuthenticated === undefined) {
        // You can return a loading spinner or splash screen here
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        );
    }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

