import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';

interface BackgroundPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectBackground: (backgroundId: string | null) => void;
  selectedBackground?: string | null;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Lista de fondos disponibles con las imágenes reales
const backgrounds = [
  { id: 'none', name: 'Ninguna', image: null },
  { id: 'hoja1', name: 'Hoja 1', image: require('@/assets/notebookBackground/hoja1.jpg') },
  { id: 'hoja2', name: 'Hoja 2', image: require('@/assets/notebookBackground/hoja2.jpg') },
  { id: 'hoja3', name: 'Hoja 3', image: require('@/assets/notebookBackground/hoja3.jpg') },
  { id: 'hoja4', name: 'Hoja 4', image: require('@/assets/notebookBackground/hoja4.jpg') },
  { id: 'hoja5', name: 'Hoja 5', image: require('@/assets/notebookBackground/hoja5.jpg') },
  { id: 'hoja6', name: 'Hoja 6', image: require('@/assets/notebookBackground/hoja6.jpg') },
  { id: 'hoja7', name: 'Hoja 7', image: require('@/assets/notebookBackground/hoja7.jpg') },
  { id: 'hoja8', name: 'Hoja 8', image: require('@/assets/notebookBackground/hoja8.jpg') },
  { id: 'hoja9', name: 'Hoja 9', image: require('@/assets/notebookBackground/hoja9.jpg') },
  { id: 'hoja10', name: 'Hoja 10', image: require('@/assets/notebookBackground/hoja10.jpg') },
];

export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({
  visible,
  onClose,
  onSelectBackground,
  selectedBackground,
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight * 0.3)).current; // Empezar desde el centro
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Agregar escala para mejor efecto

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight * 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, scaleAnim]);

  const handleSelectBackground = (backgroundId: string | null) => {
    onSelectBackground(backgroundId);
    onClose();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View 
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ],
                }
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Seleccionar Fondo</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Background Grid */}
              <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.backgroundGrid}
                showsVerticalScrollIndicator={false}
              >
                {backgrounds.map((background) => (
                  <TouchableOpacity
                    key={background.id}
                    style={[
                      styles.backgroundItem,
                      selectedBackground === background.id && styles.selectedBackground
                    ]}
                    onPress={() => handleSelectBackground(background.id === 'none' ? null : background.id)}
                  >
                    <View style={styles.backgroundPreview}>
                      {background.image ? (
                        <Image
                          source={background.image}
                          style={styles.backgroundImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.placeholderOption}>
                          <Text style={styles.placeholderText}>Sin fondo</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.backgroundName}>{background.name}</Text>
                    {selectedBackground === background.id && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    height: screenHeight * 0.7, // Altura fija en lugar de maxHeight
    paddingTop: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  backgroundGrid: {
    padding: 16,
    paddingTop: 0,
  },
  backgroundItem: {
    marginBottom: 16,
    alignItems: 'center',
  },
  backgroundPreview: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  placeholderOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backgroundPlaceholder: {
    backgroundColor: '#F9FAFB',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  noneOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  noneText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  backgroundName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  selectedBackground: {
    opacity: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6D28D9',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
