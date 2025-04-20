import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
async function connectDB() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI no está definido en las variables de entorno');
    }
    
    await mongoose.connect(mongoURI);
    console.log('📊 Conexión a MongoDB establecida');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error instanceof Error ? error.message : 'Error desconocido');
    process.exit(1);
  }
}

// Actualizar URLs de imágenes en ejercicios
async function updateEjerciciosUrls() {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('No hay conexión a la base de datos');
  }
  
  const db = mongoose.connection.db;
  const ejercicios = db.collection('ejercicios');
  
  const ejerciciosCount = await ejercicios.countDocuments();
  console.log(`📋 Total de ejercicios encontrados: ${ejerciciosCount}`);
  
  // Actualizar todos los ejercicios con URLs de imágenes PNG a WebP
  const updateResult = await ejercicios.updateMany(
    { imagen: { $regex: '\\.png$' } },
    [{ $set: { imagen: { $replaceAll: { input: '$imagen', find: '.png', replacement: '.webp' } } } }]
  );
  
  console.log(`✅ Ejercicios actualizados: ${updateResult.modifiedCount}`);
}

// Actualizar URLs de imágenes en entrenamientos
async function updateEntrenamientosUrls() {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('No hay conexión a la base de datos');
  }
  
  const db = mongoose.connection.db;
  const entrenamientos = db.collection('entrenamientos');
  
  const entrenamientosCount = await entrenamientos.countDocuments();
  console.log(`📋 Total de entrenamientos encontrados: ${entrenamientosCount}`);
  
  // Actualizar todos los entrenamientos con URLs de imágenes PNG a WebP
  const updateResult = await entrenamientos.updateMany(
    { imagen: { $regex: '\\.png$' } },
    [{ $set: { imagen: { $replaceAll: { input: '$imagen', find: '.png', replacement: '.webp' } } } }]
  );
  
  console.log(`✅ Entrenamientos actualizados: ${updateResult.modifiedCount}`);
}

// Función principal
async function main() {
  console.log('🚀 Iniciando actualización de URLs de imágenes de PNG a WebP...');
  
  // Conectar a la base de datos
  await connectDB();
  
  try {
    // Actualizar URLs en las diferentes colecciones
    await updateEjerciciosUrls();
    await updateEntrenamientosUrls();
    
    console.log('✨ Proceso de actualización completado con éxito');
  } catch (error) {
    console.error('❌ Error durante la actualización:', error instanceof Error ? error.message : 'Error desconocido');
  } finally {
    // Cerrar conexión a MongoDB
    await mongoose.disconnect();
    console.log('📊 Conexión a MongoDB cerrada');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error instanceof Error ? error.message : 'Error desconocido');
    process.exit(1);
  });
}

export { main as updateImageUrls }; 