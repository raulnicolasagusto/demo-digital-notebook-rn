import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Image as ImageIcon, Grid3X3 } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { notebookImages, getRandomNotebookImage } from '../constants/notebookImages';

interface CreateNotebookModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (notebookData: NotebookFormData) => void;
}

interface NotebookFormData {
  title: string;
  description: string;
  cover_color: string;
  cover_image?: string; // URI de imagen del dispositivo
  preset_image?: string; // ID de imagen predefinida
}

interface FormErrors {
  title?: string;
  description?: string;
}

const { height: screenHeight } = Dimensions.get('window');

export const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<NotebookFormData>({
    title: '',
    description: '',
    cover_color: '#6D28D9',
    cover_image: undefined,
    preset_image: undefined,
  });

  const [showPresetImages, setShowPresetImages] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Animaciones
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(screenHeight));

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animación de salida
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar título
    if (!formData.title.trim()) {
      newErrors.title = 'El nombre del cuaderno es obligatorio';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar descripción (opcional pero con límites)
    if (formData.description.trim().length > 250) {
      newErrors.description = 'La descripción no puede exceder 250 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    onClose();
    // Limpiar formulario al cerrar
    setTimeout(() => {
      setFormData({
        title: '',
        description: '',
        cover_color: '#6D28D9',
        cover_image: undefined,
        preset_image: undefined,
      });
      setShowPresetImages(false);
    }, 200);
  };

  const handleSave = () => {
    if (formData.title.trim()) {
      // Si no se seleccionó imagen, usar una aleatoria
      const finalData = { ...formData };
      if (!finalData.cover_image && !finalData.preset_image) {
        const randomImage = getRandomNotebookImage();
        finalData.preset_image = randomImage.id;
      }
      onSave?.(finalData);
      handleClose();
    }
  };

  const pickImageFromDevice = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Necesitamos permisos para acceder a tus fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({
        ...prev,
        cover_image: result.assets[0].uri,
        preset_image: undefined, // Limpiar imagen predefinida
      }));
    }
  };

  const selectPresetImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      preset_image: imageId,
      cover_image: undefined, // Limpiar imagen del dispositivo
    }));
    setShowPresetImages(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* Overlay difuminado */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlayBackground} />
        </TouchableWithoutFeedback>

        {/* Modal Container */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surface,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Nuevo Cuaderno
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Nombre del Cuaderno */}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Nombre del Cuaderno"
              placeholderTextColor={colors.textSecondary}
              value={formData.title}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, title: text }))
              }
              maxLength={100}
            />

            {/* Descripción Breve */}
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Descripción Breve"
              placeholderTextColor={colors.textSecondary}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              multiline
              numberOfLines={3}
              maxLength={250}
            />

            {/* Selector de Imagen de Portada */}
            <View style={styles.imageSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Imagen de portada
              </Text>

              {/* Vista previa de imagen seleccionada */}
              {(formData.cover_image || formData.preset_image) && (
                <View style={styles.imagePreview}>
                  {formData.cover_image ? (
                    <Image 
                      source={{ uri: formData.cover_image }} 
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  ) : formData.preset_image ? (
                    <Image 
                      source={notebookImages.find(img => img.id === formData.preset_image)?.source} 
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  ) : null}
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setFormData(prev => ({ 
                      ...prev, 
                      cover_image: undefined, 
                      preset_image: undefined 
                    }))}
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Botones de selección */}
              <View style={styles.imageButtons}>
                <TouchableOpacity 
                  style={[styles.imageButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={pickImageFromDevice}
                >
                  <ImageIcon size={20} color={colors.accent} />
                  <Text style={[styles.imageButtonText, { color: colors.text }]}>
                    Agregar imagen
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.imageButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setShowPresetImages(!showPresetImages)}
                >
                  <Grid3X3 size={20} color={colors.accent} />
                  <Text style={[styles.imageButtonText, { color: colors.text }]}>
                    Más portadas
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Grid de imágenes predefinidas */}
              {showPresetImages && (
                <ScrollView style={styles.presetImagesContainer} horizontal showsHorizontalScrollIndicator={false}>
                  {notebookImages.map((image) => (
                    <TouchableOpacity
                      key={image.id}
                      style={[
                        styles.presetImageOption,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        formData.preset_image === image.id && { borderColor: colors.accent, borderWidth: 2 },
                      ]}
                      onPress={() => selectPresetImage(image.id)}
                    >
                      <Image 
                        source={image.source} 
                        style={styles.presetImageThumbnail}
                        resizeMode="cover"
                      />
                      <Text style={[styles.presetImageName, { color: colors.textSecondary }]}>{image.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: colors.accent },
                !formData.title.trim() && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={!formData.title.trim()}
            >
              <Text style={styles.saveButtonText}>Crear Cuaderno</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    flex: 1,
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: screenHeight * 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    gap: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  imageSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    position: 'relative',
    alignSelf: 'center',
    marginVertical: 8,
  },
  previewImage: {
    width: 120,
    height: 80,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  presetImagesContainer: {
    maxHeight: 100,
  },
  presetImageOption: {
    width: 90,
    height: 90,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    overflow: 'hidden',
  },
  presetImageThumbnail: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  presetImageName: {
    fontSize: 10,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    // backgroundColor será dinámico según el tema
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
