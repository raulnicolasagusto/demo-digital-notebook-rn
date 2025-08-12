import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Plus, Search } from 'lucide-react-native';
import { Sidebar } from '@/components/Sidebar';
import Header from '@/components/Header';

export default function HomeScreen() {
    const { user } = useUser();
    const [activeSection, setActiveSection] = useState('notebooks');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const { width } = useWindowDimensions();
    
    // Mobile breakpoint
    const isMobile = width < 768;

    const getSectionTitle = (section: string) => {
        switch (section) {
            case 'notebooks': return 'Mis Cuadernos';
            case 'notes': return 'Mis Notas';
            case 'productivity': return 'Productividad';
            case 'readings': return 'Lecturas';
            case 'settings': return 'Configuración';
            default: return 'Mis Cuadernos';
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'notebooks':
                return (
                    <View style={styles.content}>
                        <View style={styles.contentHeader}>

                            <TouchableOpacity style={styles.addButton}>
                                <Plus size={20} color="#FFFFFF" />
                                <Text style={styles.addButtonText}>Nuevo Cuaderno</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.searchContainer}>
                            <Search size={20} color="#6B7280" />
                            <Text style={styles.searchPlaceholder}>Buscar cuadernos...</Text>
                        </View>

                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateTitle}>¡Comienza tu primer cuaderno!</Text>
                            <Text style={styles.emptyStateText}>
                                Crea tu primer cuaderno digital y comienza a organizar tus ideas.
                            </Text>
                        </View>
                    </View>
                );
            default:
                return (
                    <View style={styles.content}>
                        <Text style={styles.contentTitle}>
                            {activeSection === 'notes' && 'Mis Notas'}
                            {activeSection === 'productivity' && 'Productividad'}
                            {activeSection === 'readings' && 'Lecturas'}
                            {activeSection === 'settings' && 'Configuración'}
                        </Text>
                        <Text style={styles.comingSoon}>Próximamente...</Text>
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            {/* Header que aparece en móvil cuando el sidebar no está visible */}
            {(!isSidebarExpanded && isMobile) && (
                <Header 
                    title={getSectionTitle(activeSection)}
                    onMenuPress={() => setIsSidebarExpanded(true)}
                />
            )}
            
            <View style={styles.mainContainer}>
                <Sidebar 
                    isExpanded={isSidebarExpanded}
                    setIsExpanded={setIsSidebarExpanded}
                />
                
                <ScrollView style={[
                    styles.mainContent,
                    (!isSidebarExpanded || isMobile) && styles.mainContentFullWidth
                ]}>
                    {renderContent()}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    mainContentFullWidth: {
        marginLeft: 0, // Cuando el sidebar está colapsado, ocupa toda la pantalla
    },
    content: {
        padding: 24,
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    contentTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6D28D9',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchPlaceholder: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 300,
    },
    comingSoon: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 40,
    },
});
