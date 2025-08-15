// Archivo de configuración para las imágenes de portada disponibles
export const notebookImages = [
  {
    id: 'cover1',
    name: 'Portada 1',
    source: require('../../assets/notebook-images/portada1.jpg')
  },
  {
    id: 'cover2', 
    name: 'Portada 2',
    source: require('../../assets/notebook-images/portada2.jpg')
  },
  {
    id: 'cover3',
    name: 'Portada 3',
    source: require('../../assets/notebook-images/portada3.jpg')
  },
  {
    id: 'cover4',
    name: 'Portada 4',
    source: require('../../assets/notebook-images/portada4.jpg')
  },
  {
    id: 'cover5',
    name: 'Portada 5',
    source: require('../../assets/notebook-images/portada5.jpg')
  },
  {
    id: 'cover6',
    name: 'Portada 6',
    source: require('../../assets/notebook-images/portada6.jpg')
  },
];

// Función para obtener una imagen aleatoria
export const getRandomNotebookImage = () => {
  const randomIndex = Math.floor(Math.random() * notebookImages.length);
  return notebookImages[randomIndex];
};
