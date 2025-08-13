import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { useUser, useClerk } from '@clerk/clerk-expo';
import {
  FileText,
  Search,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  Menu,
  BookOpen,
  Target,
  Book,
} from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isExpanded, setIsExpanded }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { width } = useWindowDimensions();
  const { isDarkMode, setIsDarkMode, colors } = useTheme();

  // Animation values
  const animatedWidth = React.useRef(new Animated.Value(isExpanded ? 280 : 0)).current;
  const contentOpacity = React.useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  // Mobile breakpoint
  const isMobile = width < 768;

  useEffect(() => {
    const targetWidth = isExpanded ? (isMobile ? width * 0.8 : 280) : 0;
    
    Animated.parallel([
      Animated.spring(animatedWidth, {
        toValue: targetWidth,
        useNativeDriver: false,
        tension: 50,  // Lower tension for slower animation
        friction: 12, // Higher friction for slower animation
      }),
      Animated.timing(contentOpacity, {
        toValue: isExpanded ? 1 : 0,
        duration: isExpanded ? 300 : 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded, width, isMobile]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const animatedStyle = {
    width: animatedWidth,
    opacity: contentOpacity,
  };

  return (
    <>
      {isExpanded && isMobile && (
        <TouchableOpacity 
          style={styles.overlay}
          onPress={() => setIsExpanded(false)}
          activeOpacity={1}
        />
      )}
      
      <Animated.View style={[styles.sidebar, animatedStyle, { backgroundColor: colors.surface }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setIsExpanded(!isExpanded)}
            style={styles.toggleButton}
          >
            <Menu size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* User Profile */}
        <View style={styles.userProfile}>
          <View style={[styles.avatar, { backgroundColor: colors.background }]}>
            <User size={24} color={colors.textSecondary} />
          </View>
          <Animated.View style={[styles.userInfo, { opacity: contentOpacity }]}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.emailAddresses[0]?.emailAddress}</Text>
          </Animated.View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <BookOpen size={20} color={colors.textSecondary} />
            <Animated.Text style={[styles.menuText, { opacity: contentOpacity, color: colors.text }]}>
              Mis Cuadernos
            </Animated.Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <FileText size={20} color={colors.textSecondary} />
            <Animated.Text style={[styles.menuText, { opacity: contentOpacity, color: colors.text }]}>
              Mis Notas
            </Animated.Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Target size={20} color={colors.textSecondary} />
            <Animated.Text style={[styles.menuText, { opacity: contentOpacity, color: colors.text }]}>
              Productividad
            </Animated.Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Book size={20} color={colors.textSecondary} />
            <Animated.Text style={[styles.menuText, { opacity: contentOpacity, color: colors.text }]}>
              Lecturas
            </Animated.Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Settings size={20} color={colors.textSecondary} />
            <Animated.Text style={[styles.menuText, { opacity: contentOpacity, color: colors.text }]}>
              Configuración
            </Animated.Text>
          </TouchableOpacity>
        </View>

        {/* Dark Mode Toggle */}
        <Animated.View style={[styles.darkModeToggle, { opacity: contentOpacity }]}>
          <View style={styles.darkModeLabel}>
            {isDarkMode ? (
              <Moon size={18} color={colors.textSecondary} />
            ) : (
              <Sun size={18} color={colors.textSecondary} />
            )}
            <Text style={[styles.darkModeText, { color: colors.text }]}>Modo oscuro</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#E5E7EB', true: '#6D28D9' }}
            thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
          />
        </Animated.View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#DC2626" />
          <Animated.Text style={[styles.signOutText, { opacity: contentOpacity }]}>
            Salir
          </Animated.Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
    overflow: 'hidden',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  toggleButton: {
    padding: 8,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  menu: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },
  darkModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  darkModeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkModeText: {
    fontSize: 16,
    marginLeft: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  signOutText: {
    fontSize: 16,
    color: '#DC2626',
    marginLeft: 12,
  },
});
