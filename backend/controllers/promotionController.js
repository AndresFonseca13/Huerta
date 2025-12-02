import promotionServices from '../services/promotion/index.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = 'cocktail-images'; // mismo bucket usado en upload

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

function getBlobNameFromUrl(url) {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const parts = pathname.split('/').filter(Boolean);

    // Formato Azure: /<container>/<blob>
    if (parts[0] === SUPABASE_BUCKET) {
      return parts.slice(1).join('/');
    }

    // Formato Supabase: /storage/v1/object/public/<bucket>/<blob...>
    const bucketIndex = parts.findIndex((p) => p === SUPABASE_BUCKET);
    if (bucketIndex !== -1 && bucketIndex < parts.length - 1) {
      return parts.slice(bucketIndex + 1).join('/');
    }

    return null;
  } catch {
    return null;
  }
}

async function deleteAzureBlobIfExists(imageUrl) {
  if (!imageUrl || !supabase) return;

  const blobName = getBlobNameFromUrl(imageUrl);
  if (!blobName) return;

  try {
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .remove([blobName]);

    if (error) {
      console.warn(
        'No se pudo borrar el archivo en Supabase Storage:',
        error.message,
      );
    }
  } catch (e) {
    console.warn(
      'No se pudo borrar el archivo en Supabase Storage:',
      e?.message || e,
    );
  }
}

const list = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const result = await promotionServices.getPromotionsService({
      page,
      limit,
    });
    res.status(200).json({ mensaje: 'Ok', ...result });
  } catch (error) {
    console.error('Error listando promociones:', error);
    res.status(500).json({ mensaje: 'Error al listar promociones' });
  }
};

const create = async (req, res) => {
  try {
    const promotion = await promotionServices.createPromotionService(req.body);
    res.status(201).json({ mensaje: 'Promoción creada', promotion });
  } catch (error) {
    console.error('Error creando promoción:', error);
    res.status(500).json({ mensaje: 'Error al crear promoción' });
  }
};

const update = async (req, res) => {
  try {
    // Guard 1: máximo 2 prioritarias vigentes ahora
    if (
      typeof req.body.is_priority !== 'undefined' &&
			req.body.is_priority === true
    ) {
      const countPriorityNow =
				await promotionServices.countEligiblePriorityNowService();
      if (countPriorityNow >= 2) {
        return res.status(400).json({
          code: 'PRIORITY_LIMIT',
          mensaje:
						'Ya hay 2 promociones prioritarias vigentes ahora. Deshabilita una para priorizar otra.',
        });
      }
    }

    // Guard 2: no permitir más de 2 vigentes si la candidata también estaría vigente
    if (
      typeof req.body.is_active !== 'undefined' &&
			req.body.is_active === true
    ) {
      const candidate = await promotionServices.getPromotionByIdService(
        req.params.id,
      );
      const merged = { ...candidate, ...req.body };
      const nowList = await promotionServices.getEligiblePromotionNowService(
        {},
      );
      const others = nowList.filter((p) => p.id !== merged.id);

      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const dow = now.getDay();
      const time = now.toTimeString().slice(0, 8);

      const isWithinNow = (() => {
        if (merged.valid_from && merged.valid_from > today) return false;
        if (merged.valid_to && merged.valid_to < today) return false;
        if (
          Array.isArray(merged.days_of_week) &&
					merged.days_of_week.length > 0 &&
					!merged.days_of_week.includes(dow)
        )
          return false;
        if (merged.start_time && merged.end_time) {
          if (!(time >= merged.start_time && time <= merged.end_time))
            return false;
        }
        return true;
      })();

      if (isWithinNow && others.length >= 2) {
        return res.status(400).json({
          code: 'ACTIVE_OVERLAP_LIMIT',
          mensaje:
						'Ya hay 2 promociones vigentes en este momento. Desactiva alguna para activar otra.',
          promociones: others.map((p) => p.title),
        });
      }
    }

    const updated = await promotionServices.updatePromotionService(
      req.params.id,
      req.body,
    );
    if (!updated)
      return res.status(404).json({ mensaje: 'Promoción no encontrada' });
    res
      .status(200)
      .json({ mensaje: 'Promoción actualizada', promotion: updated });
  } catch (error) {
    console.error('Error actualizando promoción:', error);
    res.status(500).json({ mensaje: 'Error al actualizar promoción' });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await promotionServices.deletePromotionService(
      req.params.id,
    );
    if (!deleted)
      return res.status(404).json({ mensaje: 'Promoción no encontrada' });
    // Borrar imagen asociada en Azure (si existe)
    await deleteAzureBlobIfExists(deleted.image_url);
    res.status(200).json({ mensaje: 'Promoción eliminada' });
  } catch (error) {
    console.error('Error eliminando promoción:', error);
    res.status(500).json({ mensaje: 'Error al eliminar promoción' });
  }
};

const eligibleNow = async (_req, res) => {
  try {
    const promotions = await promotionServices.getEligiblePromotionNowService(
      {},
    );
    res.status(200).json({ mensaje: 'Ok', promotions });
  } catch (error) {
    console.error('Error consultando elegibilidad de promoción:', error);
    res.status(500).json({ mensaje: 'Error al consultar promoción actual' });
  }
};

export default { list, create, update, remove, eligibleNow };
