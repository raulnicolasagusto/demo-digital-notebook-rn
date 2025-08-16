import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddPage: () => void;
}

export const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onAddPage,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageButton = (pageNum: number) => {
    const isActive = pageNum === currentPage;
    return (
      <TouchableOpacity
        key={pageNum}
        style={[styles.pageButton, isActive && styles.pageButtonActive]}
        onPress={() => onPageChange(pageNum)}
      >
        <Text style={[styles.pageButtonText, isActive && styles.pageButtonTextActive]}>
          {pageNum}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAddButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={onAddPage}>
      <Plus size={16} color="#6D28D9" />
    </TouchableOpacity>
  );

  // Caso 1: Solo 1 página
  if (totalPages === 1) {
    return (
      <View style={styles.container}>
        {renderPageButton(1)}
        {renderAddButton()}
      </View>
    );
  }

  // Caso 2: 2-3 páginas - Mostrar todas
  if (totalPages <= 3) {
    return (
      <View style={styles.container}>
        {Array.from({ length: totalPages }, (_, i) => renderPageButton(i + 1))}
        {renderAddButton()}
      </View>
    );
  }

  // Caso 3: 4+ páginas - Mostrar con navegación
  return (
    <View style={styles.container}>
      {/* Botón anterior */}
      <TouchableOpacity
        style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]}
        onPress={handlePrevious}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={20} color={currentPage === 1 ? "#9CA3AF" : "#6D28D9"} />
      </TouchableOpacity>

      {/* Páginas visibles */}
      {currentPage > 1 && renderPageButton(1)}
      
      {currentPage > 2 && (
        <View style={styles.dotsContainer}>
          <Text style={styles.dotsText}>•••</Text>
        </View>
      )}

      {/* Página actual */}
      {renderPageButton(currentPage)}

      {currentPage < totalPages - 1 && (
        <View style={styles.dotsContainer}>
          <Text style={styles.dotsText}>•••</Text>
        </View>
      )}

      {currentPage < totalPages && renderPageButton(totalPages)}

      {/* Botón siguiente */}
      <TouchableOpacity
        style={[styles.navButton, currentPage === totalPages && styles.navButtonDisabled]}
        onPress={handleNext}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={20} color={currentPage === totalPages ? "#9CA3AF" : "#6D28D9"} />
      </TouchableOpacity>

      {/* Botón agregar */}
      {renderAddButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 12, // Más espacio en Android
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pageButtonActive: {
    backgroundColor: '#6D28D9',
    borderColor: '#6D28D9',
  },
  pageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  pageButtonTextActive: {
    color: '#FFFFFF',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  dotsContainer: {
    paddingHorizontal: 4,
  },
  dotsText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 12,
  },
});
