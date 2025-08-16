import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface NoteImage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  source: any;
}

interface CanvasNoteImagesProps {
  noteImages: NoteImage[];
  onNotePress?: (noteId: string) => void;
  onDeleteNote?: (noteId: string) => void;
}

export const CanvasNoteImages: React.FC<CanvasNoteImagesProps> = ({
  noteImages,
  onNotePress,
  onDeleteNote,
}) => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {noteImages.map((note) => (
        <View
          key={note.id}
          style={[
            styles.noteImageContainer,
            {
              left: note.x,
              top: note.y,
              width: note.width,
              height: note.height,
            },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.noteImageTouchable}
            onPress={() => onNotePress?.(note.id)}
            onLongPress={() => onDeleteNote?.(note.id)}
            activeOpacity={0.8}
          >
            <Image
              source={note.source}
              style={styles.noteImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  noteImageContainer: {
    position: 'absolute',
    zIndex: 1, // Por debajo de trazos (zIndex: 10) y texto (zIndex: 1000)
  },
  noteImageTouchable: {
    width: '100%',
    height: '100%',
  },
  noteImage: {
    width: '100%',
    height: '100%',
  },
});
