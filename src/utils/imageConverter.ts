import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getS3BaseUrl } from './s3Service';

interface ConversionStats {
  totalFiles: number;
  convertedFiles: number;
  errors: number;
  originalSize: number;
  webpSize: number;
}

/**
 * Convierte imágenes PNG a WebP en directorios específicos
 */
export async function convertPngToWebp(options: {
  rootPaths?: string[];
  quality?: number;
  deleteOriginals?: boolean;
}): Promise<ConversionStats> {
  // Valores por defecto
  const rootPaths = options.rootPaths || [
    path.join(process.cwd(), '..', 'imagenes/ejercicios'),
    path.join(process.cwd(), '..', 'imagenes/entrenamientos')
  ];
  const quality = options.quality || 80;
  const deleteOriginals = options.deleteOriginals || false;

  // Estadísticas
  const stats: ConversionStats = {
    totalFiles: 0,
    convertedFiles: 0,
    errors: 0,
    originalSize: 0,
    webpSize: 0
  };

  // Función para convertir un archivo
  async function convertFile(filePath: string): Promise<void> {
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, '.png');
    const webpPath = path.join(fileDir, `${fileName}.webp`);
    
    try {
      // Obtener tamaño original
      const originalStat = fs.statSync(filePath);
      stats.originalSize += originalStat.size;
      
      // Convertir a WebP
      await sharp(filePath)
        .webp({ quality })
        .toFile(webpPath);
      
      // Obtener tamaño del WebP generado
      const webpStat = fs.statSync(webpPath);
      stats.webpSize += webpStat.size;
      
      const savingPercent = ((originalStat.size - webpStat.size) / originalStat.size * 100).toFixed(2);
      console.log(`✅ Convertido: ${filePath} → ${webpPath} (Ahorro: ${savingPercent}%)`);
      
      // Eliminar original si se especificó
      if (deleteOriginals) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Eliminado original: ${filePath}`);
      }
      
      stats.convertedFiles++;
    } catch (error) {
      console.error(`❌ Error al convertir ${filePath}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      stats.errors++;
    }
  }

  // Función recursiva para procesar directorios
  async function processDirectory(directory: string): Promise<void> {
    try {
      const items = fs.readdirSync(directory);
      
      for (const item of items) {
        const itemPath = path.join(directory, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // Si es un directorio, procesarlo recursivamente
          await processDirectory(itemPath);
        } else if (stat.isFile() && path.extname(itemPath).toLowerCase() === '.png') {
          // Si es un archivo PNG, convertirlo
          stats.totalFiles++;
          await convertFile(itemPath);
        }
      }
    } catch (error) {
      console.error(`❌ Error al procesar directorio ${directory}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Procesar cada directorio raíz
  console.log('🚀 Iniciando conversión de PNG a WebP...');
  
  for (const dir of rootPaths) {
    if (fs.existsSync(dir)) {
      console.log(`📂 Procesando directorio: ${dir}`);
      await processDirectory(dir);
    } else {
      console.warn(`⚠️ El directorio ${dir} no existe. Saltando...`);
    }
  }

  return stats;
}

/**
 * Convierte un archivo PNG específico a WebP
 * @param filePath Ruta completa del archivo PNG a convertir
 * @param quality Calidad de la conversión (1-100)
 * @param deleteOriginal Si debe eliminarse el archivo original
 */
export async function convertSinglePngFile(options: {
  filePath: string;
  quality?: number;
  deleteOriginal?: boolean;
}): Promise<{
  success: boolean;
  webpPath?: string;
  error?: string;
  originalSize?: number;
  webpSize?: number;
  savingPercent?: string;
}> {
  const { filePath, quality = 90, deleteOriginal = false } = options;
  
  // Verificar que el archivo existe y es PNG
  if (!fs.existsSync(filePath)) {
    return { 
      success: false, 
      error: `El archivo ${filePath} no existe` 
    };
  }
  
  if (path.extname(filePath).toLowerCase() !== '.png') {
    return { 
      success: false, 
      error: `El archivo ${filePath} no es un PNG` 
    };
  }

  try {
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, '.png');
    const webpPath = path.join(fileDir, `${fileName}.webp`);
    
    // Obtener tamaño original
    const originalStat = fs.statSync(filePath);
    
    // Convertir a WebP
    await sharp(filePath)
      .webp({ quality })
      .toFile(webpPath);
    
    // Obtener tamaño del WebP generado
    const webpStat = fs.statSync(webpPath);
    
    const savingPercent = ((originalStat.size - webpStat.size) / originalStat.size * 100).toFixed(2);
    console.log(`✅ Convertido: ${filePath} → ${webpPath} (Ahorro: ${savingPercent}%)`);
    
    // Eliminar original si se especificó
    if (deleteOriginal) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Eliminado original: ${filePath}`);
    }
    
    return {
      success: true,
      webpPath,
      originalSize: originalStat.size,
      webpSize: webpStat.size,
      savingPercent
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`❌ Error al convertir ${filePath}: ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Si se ejecuta directamente (no importado como módulo)
if (require.main === module) {
  // Verificar que sharp esté instalado
  try {
    require.resolve('sharp');
    
    // Verificar los argumentos de línea de comandos
    const args = process.argv.slice(2);
    const placeholderPath = args[0] || "C:\\Users\\ramos\\Desktop\\ledfit\\imagenes\\ejercicios\\placeholder_workout.png";
    
    // Si se pasa un argumento específico, convertir solo ese archivo
    if (placeholderPath) {
      console.log(`🖼️ Convirtiendo placeholder: ${placeholderPath}`);
      
      convertSinglePngFile({
        filePath: placeholderPath,
        quality: 90,
        deleteOriginal: false // No eliminar por defecto
      }).then(result => {
        if (result.success) {
          console.log('\n📊 RESULTADO');
          console.log('==========================================');
          console.log(`Archivo original: ${placeholderPath}`);
          console.log(`Archivo WebP: ${result.webpPath}`);
          
          const originalSizeMB = (result.originalSize! / (1024 * 1024)).toFixed(2);
          const webpSizeMB = (result.webpSize! / (1024 * 1024)).toFixed(2);
          
          console.log(`Tamaño original: ${originalSizeMB} MB`);
          console.log(`Tamaño WebP: ${webpSizeMB} MB`);
          console.log(`Ahorro: ${result.savingPercent}%`);
          console.log('==========================================');
          console.log('\n✅ Conversión completada exitosamente');
          
          // Usar el servicio S3 para obtener la URL base
          const s3BaseUrl = getS3BaseUrl();
          const fileName = path.basename(result.webpPath || '');
          console.log('Recuerda subir el archivo WebP a tu bucket de S3 en la ruta:');
          
          if (s3BaseUrl) {
            console.log(`${s3BaseUrl}/images/ejercicios/${fileName}`);
          } else {
            console.log(`s3://${process.env.S3_BUCKET_NAME || 'ledfit'}/images/ejercicios/${fileName}`);
          }
        } else {
          console.error(`\n❌ Error: ${result.error}`);
        }
      });
    } else {
      // Ejecutar la conversión normal de directorios
      convertPngToWebp({
        deleteOriginals: false // No eliminar originales por defecto cuando se ejecuta directamente
      }).then(stats => {
        // Mostrar estadísticas
        console.log('\n📊 ESTADÍSTICAS');
        console.log('==========================================');
        console.log(`Total archivos PNG encontrados: ${stats.totalFiles}`);
        console.log(`Archivos convertidos exitosamente: ${stats.convertedFiles}`);
        console.log(`Errores: ${stats.errors}`);
        
        const totalOriginalMB = (stats.originalSize / (1024 * 1024)).toFixed(2);
        const totalWebpMB = (stats.webpSize / (1024 * 1024)).toFixed(2);
        const savingMB = (stats.originalSize - stats.webpSize) / (1024 * 1024);
        const savingPercent = ((stats.originalSize - stats.webpSize) / stats.originalSize * 100).toFixed(2);
        
        console.log(`\nTamaño original: ${totalOriginalMB} MB`);
        console.log(`Tamaño WebP: ${totalWebpMB} MB`);
        console.log(`Ahorro: ${savingMB.toFixed(2)} MB (${savingPercent}%)`);
        console.log('==========================================');
      }).catch(error => {
        console.error(`Error en la ejecución: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      });
    }
  } catch (error) {
    console.error('\n❌ ERROR: El módulo "sharp" no está instalado.');
    console.log('Por favor, instálalo con el siguiente comando:');
    console.log('\nnpm install sharp\n');
  }
} 