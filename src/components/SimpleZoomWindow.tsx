import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';
import { X, Move } from 'lucide-react-native';

interface SimpleZoomWindowProps {
  isActive: boolean;
  onClose: () => void;
}

export const SimpleZoomWindow: React.FC<SimpleZoomWindowProps> = ({
  isActive,
  onClose
}) => {
  if (!isActive) return null;

  return (
    <>
      {/* Zoom Area Indicator on Main Canvas */}
      <View style={styles.zoomIndicator}>
        <View style={styles.zoomIndicatorBorder}>
          <Move size={16} color="#6D28D9" />
        </View>
      </View>

      {/* Bottom Zoom Window */}
      <View style={styles.zoomWindow}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Zoom Area (Test)</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Drawing Area */}
        <View style={styles.drawingArea}>
          <Text style={styles.debugText}>Zoom Window Active - Test Version</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  zoomIndicator: {
    position: 'absolute',
    left: 100,
    top: 200,
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#6D28D9',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
    zIndex: 1000,
  },
  zoomIndicatorBorder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomWindow: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  drawingArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugText: {
    color: '#666',
    fontSize: 14,
  },
});