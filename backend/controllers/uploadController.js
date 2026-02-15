import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = 'cocktail-images';

function slugify(str) {
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

// Inicializar cliente de Supabase
// Usar auth: { persistSession: false } para evitar problemas con JWT en el servidor
const supabase =
	SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
	  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	    auth: {
	      persistSession: false,
	      autoRefreshToken: false,
	    },
		  })
	  : null;

// Log para depuración (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  console.log('Configuración de Supabase Storage:');
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'Configurado' : 'No configurado');
  console.log(
    'SUPABASE_SERVICE_ROLE_KEY:',
    SUPABASE_SERVICE_ROLE_KEY ? 'Configurado' : 'No configurado',
  );
}

export const uploadImage = async (req, res) => {
  // Verificar si se recibieron archivos
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      error: true,
      mensaje: 'No se han proporcionado imágenes',
    });
  }

  const cocktailNameRaw = req.body.cocktailName || 'imagen-coctel';
  const cocktailSlug = slugify(cocktailNameRaw);

  // Verificar la configuración de Supabase con mensajes más específicos
  if (!SUPABASE_URL) {
    return res.status(500).json({
      error: true,
      mensaje:
				'Error de configuración: Falta SUPABASE_URL en las variables de entorno',
    });
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      error: true,
      mensaje:
				'Error de configuración: Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno',
    });
  }

  if (!supabase) {
    return res.status(500).json({
      error: true,
      mensaje:
				'Error de configuración: No se pudo inicializar el cliente de Supabase',
    });
  }

  try {
    // Array para almacenar las URLs de las imágenes subidas
    const uploadedUrls = [];

    // Procesar cada archivo
    for (const file of req.files) {
      // Generar un nombre único para el archivo usando timestamp para evitar sobrescribir
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = `${cocktailSlug}-${timestamp}-${randomSuffix}.webp`;

      // Procesar imagen con sharp: redimensionar SOLO el ancho a 600px, sin recortar
      const optimizedBuffer = await sharp(file.buffer)
        .resize({ width: 600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      // Subir el archivo optimizado a Supabase Storage
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, optimizedBuffer, {
          contentType: 'image/webp',
          upsert: false, // No sobrescribir si existe
        });

      if (error) {
        console.error('Error al subir imagen a Supabase:', error);
        throw error;
      }

      // Obtener URL pública de la imagen
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      } else {
        // Fallback: construir URL manualmente si getPublicUrl no funciona
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`;
        uploadedUrls.push(publicUrl);
      }
    }

    const response = {
      error: false,
      mensaje: 'Imágenes subidas exitosamente',
      urls: uploadedUrls,
    };

    console.log('Respuesta del backend:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error al subir la imagen:', error);

    // Manejar errores específicos de Supabase
    if (error.message?.includes('Bucket not found')) {
      return res.status(500).json({
        error: true,
        mensaje: `Error: El bucket "${bucketName}" no existe en Supabase Storage. Por favor, créalo en el panel de Supabase.`,
      });
    }

    if (error.message?.includes('JWT') || error.message?.includes('JWS')) {
      return res.status(500).json({
        error: true,
        mensaje:
					'Error de autenticación con Supabase. Verifica que SUPABASE_SERVICE_ROLE_KEY sea la clave \'service_role\' (secret) y no la clave \'anon\' (pública).',
      });
    }

    // Log detallado del error en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.error('Detalles del error:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
    }

    res.status(500).json({
      error: true,
      mensaje: 'Error al subir la imagen',
    });
  }
};
