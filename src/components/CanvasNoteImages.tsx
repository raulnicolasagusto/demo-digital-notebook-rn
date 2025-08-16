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
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
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
        >
          <Image
            source={note.source}
            style={styles.noteImage}
            resizeMode="contain"
          />
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
  noteImage: {
    width: '100%',
    height: '100%',
  },
});
