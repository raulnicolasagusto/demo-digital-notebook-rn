import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Plus, Search } from 'lucide-react-native';
import { Sidebar } from '@/components/Sidebar';
import Header from '@/components/Header';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { CreateNotebookModal } from '@/components/CreateNotebookModal';
// import { SupabaseTestComponent } from '@/components/SupabaseTestComponent'; // Comentado para producción

export default function HomeScreen() {
    const { user } = useUser();
    const router = useRouter();
    const { colors } = useTheme();
    const [activeSection, setActiveSection] = useState('notebooks');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
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
                        <TouchableOpacity 
                            style={[styles.createButton, { backgroundColor: colors.accent }]}
                            onPress={() => setShowCreateModal(true)}
                        >
                            <Text style={styles.createButtonText}>Crear Cuaderno</Text>
                        </TouchableOpacity>
                        
                        <View style={styles.notebooksGrid}>
                            <TouchableOpacity 
                                style={[styles.notebookCard, { backgroundColor: colors.surface }]} 
                                activeOpacity={0.8}
                                onPress={() => router.push('/notebook/1')}
                            >
                                <View style={[styles.notebookImage, { backgroundColor: colors.background }]}>
                                    {/* Placeholder para imagen */}
                                </View>
                                <Text style={[styles.notebookTitle, { color: colors.text }]}>Ideas Iniciales</Text>
                                <Text style={[styles.notebookSubtitle, { color: colors.textSecondary }]}>Primeras notas y bocetos para ...</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.notebookCard, { backgroundColor: colors.surface }]} 
                                activeOpacity={0.8}
                                onPress={() => router.push('/notebook/2')}
                            >
                                <View style={[styles.notebookImage, { backgroundColor: colors.background }]}>
                                    {/* Placeholder para imagen */}
                                </View>
                                <Text style={[styles.notebookTitle, { color: colors.text }]}>Recetas de Cocina</Text>
                                <Text style={[styles.notebookSubtitle, { color: colors.textSecondary }]}>Mis recetas favoritas y por ...</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            default:
                return (
                    <View style={styles.content}>
                        <Text style={[styles.contentTitle, { color: colors.text }]}>
                            {activeSection === 'notes' && 'Mis Notas'}
                            {activeSection === 'productivity' && 'Productividad'}
                            {activeSection === 'readings' && 'Lecturas'}
                            {activeSection === 'settings' && 'Configuración'}
                        </Text>
                        <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>Próximamente...</Text>
                    </View>
                );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                    { backgroundColor: colors.background },
                    (!isSidebarExpanded || isMobile) && styles.mainContentFullWidth
                ]}>
                    {/* Componente de prueba de Supabase - Comentado para producción */}
                    {/* <SupabaseTestComponent /> */}
                    
                    {renderContent()}
                </ScrollView>
            </View>

            {/* Modal para crear cuaderno */}
            <CreateNotebookModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSave={(notebookData) => {
                    console.log('Nuevo cuaderno:', notebookData);
                    // TODO: Implementar guardado en base de datos
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    mainContent: {
        flex: 1,
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
        textAlign: 'center',
        marginTop: 40,
    },
    createButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    notebooksGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    notebookCard: {
        borderRadius: 12,
        padding: 16,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        transform: [{ scale: 1 }],
    },
    notebookImage: {
        height: 120,
        borderRadius: 8,
        marginBottom: 12,
    },
    notebookTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    notebookSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
});
