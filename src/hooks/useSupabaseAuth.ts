import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';

export const useSupabaseAuth = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const configureSupabaseAuth = async () => {
      if (user) {
        try {
          // Obtener el token de sesión de Clerk (con los custom claims configurados en Sessions)
          const token = await getToken();
          
          if (token) {
            // Configurar el token en Supabase
            const { data, error } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: '',
            });
            
            if (error) {
              console.error('❌ Error setting Supabase session:', error);
            } else {
              console.log('✅ Supabase session configured successfully');
            }
          }
        } catch (error) {
          console.error('❌ Error configuring Supabase auth:', error);
        }
      } else {
        // Si no hay usuario, limpiar la sesión de Supabase
        await supabase.auth.signOut();
        console.log('🔒 Supabase session cleared');
      }
    };

    configureSupabaseAuth();
  }, [user, getToken]);

  return { user };
};
