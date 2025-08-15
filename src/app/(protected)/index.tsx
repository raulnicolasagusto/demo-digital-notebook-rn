import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Alert, ActivityIndicator, Image } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Plus, Search } from 'lucide-react-native';
import { Sidebar } from '@/components/Sidebar';
import Header from '@/components/Header';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { CreateNotebookModal } from '@/components/CreateNotebookModal';
import { createSupabaseClientWithAuth } from '@/lib/supabase';
import { notebookImages } from '@/constants/notebookImages';
// import { SupabaseTestComponent } from '@/components/SupabaseTestComponent'; // Comentado para producción

export default function HomeScreen() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const [activeSection, setActiveSection] = useState('notebooks');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [notebooks, setNotebooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const notebooksPerPage = 6;
    const { width } = useWindowDimensions();
    
    // Mobile breakpoint
    const isMobile = width < 768;

    // Función para renderizar la portada del cuaderno
    const renderNotebookCover = (notebook: any) => {
        // Si tiene metadatos de portada
        if (notebook.cover_metadata) {
            try {
                const coverData = typeof notebook.cover_metadata === 'string' 
                    ? JSON.parse(notebook.cover_metadata) 
                    : notebook.cover_metadata;

                if (coverData.type === 'preset_image') {
                    // Buscar la imagen predefinida
                    const presetImage = notebookImages.find(img => img.id === coverData.value);
                    if (presetImage) {
                        return (
                            <Image 
                                source={presetImage.source} 
                                style={styles.coverImage}
                                resizeMode="cover"
                            />
                        );
                    }
                } else if (coverData.type === 'device_image' && coverData.value) {
                    // Imagen del dispositivo
                    return (
                        <Image 
                            source={{ uri: coverData.value }} 
                            style={styles.coverImage}
                            resizeMode="cover"
                        />
                    );
                }
            } catch (error) {
                console.log('Error parsing cover metadata:', error);
            }
        }
        
        // Fallback: color de fondo
        return null;
    };

    // Función para obtener cuadernos desde Supabase
    const fetchNotebooks = async (page: number = 1) => {
        try {
            if (!user) return;

            const token = await getToken();
            if (!token) return;

            const authenticatedSupabase = createSupabaseClientWithAuth(token);

            // Calcular offset para paginación
            const offset = (page - 1) * notebooksPerPage;

            // Obtener total de cuadernos para calcular páginas
            const { count } = await authenticatedSupabase
                .from('notebooks')
                .select('*', { count: 'exact', head: true });

            // Obtener cuadernos de la página actual
            const { data: notebooksData, error } = await authenticatedSupabase
                .from('notebooks')
                .select(`
                    id,
                    title,
                    description,
                    cover_color,
                    cover_metadata,
                    is_favorite,
                    created_at,
                    updated_at
                `)
                .order('updated_at', { ascending: false })
                .range(offset, offset + notebooksPerPage - 1);

            if (error) throw error;

            setNotebooks(notebooksData || []);
            setTotalPages(Math.ceil((count || 0) / notebooksPerPage));
            setCurrentPage(page);

        } catch (error: any) {
            console.error('Error al cargar cuadernos:', error);
            Alert.alert('Error', 'No se pudieron cargar los cuadernos');
        } finally {
            setLoading(false);
        }
    };

    // Cargar cuadernos al montar el componente
    useEffect(() => {
        if (user && activeSection === 'notebooks') {
            fetchNotebooks(1);
        }
    }, [user, activeSection]);

    // Función para crear notebook en Supabase
    const handleCreateNotebook = async (notebookData: any) => {
        try {
            if (!user) {
                Alert.alert('Error', 'Usuario no autenticado');
                return;
            }

            // Obtener token de Clerk
            const token = await getToken();
            if (!token) {
                Alert.alert('Error', 'No se pudo obtener el token de autenticación');
                return;
            }

            // Crear cliente autenticado
            const authenticatedSupabase = createSupabaseClientWithAuth(token);

            // Verificar/crear usuario en Supabase
            const { data: existingUser } = await authenticatedSupabase
                .from('users')
                .select('id')
                .eq('clerk_user_id', user.id)
                .single();

            let userId;
            if (existingUser) {
                userId = existingUser.id;
            } else {
                // Crear usuario si no existe
                const { data: newUser, error: userError } = await authenticatedSupabase
                    .from('users')
                    .insert({
                        clerk_user_id: user.id,
                        email: user.emailAddresses[0]?.emailAddress || '',
                        display_name: user.fullName || user.firstName || 'Usuario',
                        avatar_url: user.imageUrl,
                    })
                    .select('id')
                    .single();

                if (userError) throw userError;
                userId = newUser.id;
            }

            // Preparar datos de imagen de portada
            let coverData = {
                type: 'color',
                value: notebookData.cover_color
            };

            if (notebookData.cover_image) {
                // Imagen del dispositivo - por ahora guardamos la URI
                // TODO: Implementar subida a Supabase Storage
                coverData = {
                    type: 'device_image',
                    value: notebookData.cover_image
                };
            } else if (notebookData.preset_image) {
                // Imagen predefinida
                coverData = {
                    type: 'preset_image',
                    value: notebookData.preset_image
                };
            }

            // Crear notebook
            const { data: notebook, error: notebookError } = await authenticatedSupabase
                .from('notebooks')
                .insert({
                    user_id: userId,
                    title: notebookData.title.trim(),
                    description: notebookData.description.trim() || null,
                    cover_color: notebookData.cover_color,
                    cover_metadata: JSON.stringify(coverData), // Guardar metadatos de portada
                    is_favorite: false,
                })
                .select()
                .single();

            if (notebookError) throw notebookError;

            // Crear primera página del notebook
            const { error: pageError } = await authenticatedSupabase
                .from('notebook_pages')
                .insert({
                    notebook_id: notebook.id,
                    page_number: 1,
                    canvas_data: { paths: [], textElements: [] },
                });

            if (pageError) throw pageError;

            Alert.alert(
                'Éxito', 
                'Cuaderno creado exitosamente',
                [
                    {
                        text: 'Ver cuaderno',
                        onPress: () => router.push(`/notebook/${notebook.id}`)
                    },
                    { text: 'OK' }
                ]
            );

            // Refrescar la lista de cuadernos
            fetchNotebooks(1);

        } catch (error: any) {
            console.error('Error al crear cuaderno:', error);
            Alert.alert(
                'Error', 
                `No se pudo crear el cuaderno: ${error.message || 'Error desconocido'}`
            );
        }
    };

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
                        
                        {/* Estado de carga */}
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.accent} />
                                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                    Cargando cuadernos...
                                </Text>
                            </View>
                        ) : notebooks.length === 0 ? (
                            /* Estado vacío */
                            <View style={styles.emptyState}>
                                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                                    No tienes cuadernos aún
                                </Text>
                                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                                    Crea tu primer cuaderno para empezar a escribir tus ideas
                                </Text>
                            </View>
                        ) : (
                            /* Grid de cuadernos */
                            <>
                                <View style={styles.notebooksGrid}>
                                    {notebooks.map((notebook, index) => (
                                        <TouchableOpacity 
                                            key={notebook.id}
                                            style={[
                                                styles.notebookCard, 
                                                { backgroundColor: colors.surface },
                                                // Responsive: 2 columnas en móvil, 3 en tablet
                                                { width: isMobile ? '48%' : '31%' }
                                            ]} 
                                            activeOpacity={0.8}
                                            onPress={() => router.push(`/notebook/${notebook.id}`)}
                                        >
                                            <View style={[
                                                styles.notebookImage, 
                                                { backgroundColor: notebook.cover_color || colors.background }
                                            ]}>
                                                {renderNotebookCover(notebook)}
                                            </View>
                                            <Text style={[styles.notebookTitle, { color: colors.text }]} numberOfLines={1}>
                                                {notebook.title}
                                            </Text>
                                            <Text style={[styles.notebookSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                                                {notebook.description || 'Sin descripción'}
                                            </Text>
                                            <Text style={[styles.notebookDate, { color: colors.textSecondary }]}>
                                                {new Date(notebook.updated_at).toLocaleDateString()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Paginación */}
                                {totalPages > 1 && (
                                    <View style={styles.pagination}>
                                        <TouchableOpacity
                                            style={[
                                                styles.pageButton,
                                                { backgroundColor: colors.surface },
                                                currentPage === 1 && styles.disabledPageButton
                                            ]}
                                            onPress={() => currentPage > 1 && fetchNotebooks(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <Text style={[
                                                styles.pageButtonText, 
                                                { color: currentPage === 1 ? colors.textSecondary : colors.text }
                                            ]}>
                                                Anterior
                                            </Text>
                                        </TouchableOpacity>

                                        <Text style={[styles.pageInfo, { color: colors.text }]}>
                                            {currentPage} de {totalPages}
                                        </Text>

                                        <TouchableOpacity
                                            style={[
                                                styles.pageButton,
                                                { backgroundColor: colors.surface },
                                                currentPage === totalPages && styles.disabledPageButton
                                            ]}
                                            onPress={() => currentPage < totalPages && fetchNotebooks(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <Text style={[
                                                styles.pageButtonText, 
                                                { color: currentPage === totalPages ? colors.textSecondary : colors.text }
                                            ]}>
                                                Siguiente
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
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
                onSave={handleCreateNotebook}
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
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    notebookCard: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 12,
    },
    notebookImage: {
        height: 120,
        borderRadius: 8,
        marginBottom: 12,
    },
    coverImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    notebookTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    notebookSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    notebookDate: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        paddingHorizontal: 16,
    },
    pageButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    disabledPageButton: {
        opacity: 0.5,
    },
    pageButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    pageInfo: {
        fontSize: 14,
        fontWeight: '500',
    },
});
