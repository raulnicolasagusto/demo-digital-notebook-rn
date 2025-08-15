import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { useUser, useAuth } from '@clerk/clerk-expo'
import { supabase, createSupabaseClientWithAuth } from '../lib/supabase'

export const SupabaseTestComponent: React.FC = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [userSyncStatus, setUserSyncStatus] = useState<string>('Not tested')

  useEffect(() => {
    testSupabaseConnection()
    if (user) {
      testUserSync()
    }
  }, [user])

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        console.error('Supabase connection error:', error)
        setConnectionStatus(`❌ Error: ${error.message}`)
      } else {
        setConnectionStatus('✅ Supabase connected')
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionStatus(`❌ Failed: ${error}`)
    }
  }

  const testUserSync = async () => {
    if (!user) return

    setUserSyncStatus('🔄 Obteniendo token de Clerk...')

    try {
      // Obtener el token de Clerk
      const token = await getToken();

      if (!token) {
        setUserSyncStatus('❌ No se pudo obtener el token de Clerk')
        return
      }

      // Decodificar el token para debug (solo para desarrollo)
      try {
        const tokenParts = token.split('.')
        const payload = JSON.parse(atob(tokenParts[1]))
        console.log('🔍 Token payload:', payload)
        console.log('🔍 Token sub:', payload.sub)
        console.log('🔍 Token role:', payload.role)
      } catch (decodeError) {
        console.log('⚠️ No se pudo decodificar el token para debug')
      }

      console.log('✅ Token obtenido de Clerk')
      setUserSyncStatus('🔄 Sincronizando usuario con Supabase...')

      // Crear cliente autenticado con el token de Clerk
      const authenticatedSupabase = createSupabaseClientWithAuth(token)

      // Realizar la petición con el cliente autenticado
      // Primero intentar buscar si el usuario ya existe
      const { data: existingUser } = await authenticatedSupabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single()

      let userData;
      if (existingUser) {
        // Usuario existe, actualizar
        const { data, error } = await authenticatedSupabase
          .from('users')
          .update({
            email: user.emailAddresses[0]?.emailAddress || '',
            display_name: user.fullName || user.firstName || 'Usuario',
            avatar_url: user.imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('clerk_user_id', user.id)
          .select()
          .single()

        if (error) throw error
        userData = data
      } else {
        // Usuario no existe, crear nuevo
        const { data, error } = await authenticatedSupabase
          .from('users')
          .insert({
            clerk_user_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            display_name: user.fullName || user.firstName || 'Usuario',
            avatar_url: user.imageUrl,
          })
          .select()
          .single()

        if (error) throw error
        userData = data
      }

      console.log('✅ User synced:', userData)
      setUserSyncStatus('✅ Usuario sincronizado exitosamente')
      
      // Test notebook creation with the correct user_id (UUID from users table)
      if (userData) {
        await testNotebookCreation(userData.id, authenticatedSupabase)
      }

    } catch (error: any) {
      console.error('❌ User sync failed:', error)
      setUserSyncStatus(`❌ Error: ${error.message || error} (${error.code || 'N/A'})`)
      
      // Información adicional para debugging
      if (error.code === '42501') {
        setUserSyncStatus(prev => prev + '\n💡 Verificar Third-Party Auth en Supabase')
      }
    }
  }

  const testNotebookCreation = async (userId: string, authenticatedSupabase?: any) => {
    try {
      const clientToUse = authenticatedSupabase || supabase
      const { data, error } = await clientToUse
        .from('notebooks')
        .insert({
          user_id: userId,
          title: 'Test Notebook',
          description: 'Notebook de prueba',
          cover_color: '#6D28D9'
        })
        .select()

      if (error) {
        console.error('Notebook creation error:', error)
        Alert.alert('Notebook Test', `❌ Error: ${error.message}`)
      } else {
        console.log('Test notebook created:', data)
        Alert.alert('Notebook Test', '✅ Test notebook created!')
      }
    } catch (error) {
      console.error('Notebook creation failed:', error)
      Alert.alert('Notebook Test', `❌ Failed: ${error}`)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Supabase Test</Text>
      
      <View style={styles.testItem}>
        <Text style={styles.label}>Connection:</Text>
        <Text style={styles.status}>{connectionStatus}</Text>
      </View>

      <View style={styles.testItem}>
        <Text style={styles.label}>User Sync:</Text>
        <Text style={styles.status}>{userSyncStatus}</Text>
      </View>

      {user && (
        <View style={styles.testItem}>
          <Text style={styles.label}>User Info:</Text>
          <Text style={styles.info}>ID: {user.id.substring(0, 20)}...</Text>
          <Text style={styles.info}>Email: {user.emailAddresses[0]?.emailAddress}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f0f9ff',
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#0369a1',
  },
  testItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#374151',
  },
  status: {
    fontSize: 12,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  info: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 1,
  },
})