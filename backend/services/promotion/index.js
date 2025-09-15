import pool from '../../config/db.js';

export const createPromotionService = async (payload) => {
  const {
    title,
    description,
    image_url,
    valid_from,
    valid_to,
    start_time,
    end_time,
    days_of_week,
    is_active = true,
    is_priority = false,
    applicability = [],
  } = payload;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPromo = `
      INSERT INTO promotions
        (title, description, image_url, valid_from, valid_to, start_time, end_time, days_of_week, is_active, is_priority)
      VALUES (
        $1,
        $2,
        $3,
        COALESCE($4::date, CURRENT_DATE),
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )
      RETURNING *;
    `;
    const values = [
      title,
      description ?? null,
      image_url ?? null,
      valid_from ?? null,
      valid_to ?? null,
      start_time ?? null,
      end_time ?? null,
      Array.isArray(days_of_week) ? days_of_week : null,
      Boolean(is_active),
      Boolean(is_priority),
    ];
    const { rows } = await client.query(insertPromo, values);
    const promotion = rows[0];

    if (Array.isArray(applicability) && applicability.length > 0) {
      for (const target of applicability) {
        const { category_id, product_id, category_type } = target;
        await client.query(
          `INSERT INTO promotion_applicability (promotion_id, category_id, product_id, category_type)
           VALUES ($1,$2,$3,$4)`,
          [
            promotion.id,
            category_id ?? null,
            product_id ?? null,
            category_type ?? null,
          ],
        );
      }
    }

    await client.query('COMMIT');
    return promotion;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getPromotionsService = async ({ page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const listQuery =
		'SELECT * FROM promotions ORDER BY created_at DESC LIMIT $1 OFFSET $2';
  const countQuery = 'SELECT COUNT(*) AS total FROM promotions';
  const [listRes, countRes] = await Promise.all([
    pool.query(listQuery, [limit, offset]),
    pool.query(countQuery),
  ]);
  return {
    promotions: listRes.rows,
    pagination: {
      totalRecords: Number(countRes.rows[0].total),
      totalPages: Math.ceil(Number(countRes.rows[0].total) / limit),
      currentPage: page,
      limit,
      offset,
    },
  };
};

export const getPromotionByIdService = async (id) => {
  const { rows } = await pool.query('SELECT * FROM promotions WHERE id = $1', [
    id,
  ]);
  return rows[0] ?? null;
};

export const updatePromotionService = async (id, data) => {
  // Construcción dinámica simple
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    if (
      [
        'title',
        'description',
        'image_url',
        'valid_from',
        'valid_to',
        'start_time',
        'end_time',
        'days_of_week',
        'is_active',
        'is_priority',
      ].includes(key)
    ) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }
  if (fields.length === 0) return null;
  values.push(id);
  const sql = `UPDATE promotions SET ${fields.join(
    ', ',
  )} , updated_at = NOW() WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(sql, values);
  return rows[0] ?? null;
};

export const deletePromotionService = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM promotions WHERE id = $1 RETURNING *',
    [id],
  );
  return rows[0] ?? null;
};

export const getEligiblePromotionNowService = async ({
  now = new Date(),
} = {}) => {
  // Determina promociones activas y vigentes por fecha/hora/día
  const tzNow = now; // Suponemos timezone del servidor/DB
  const today = tzNow.toISOString().slice(0, 10); // YYYY-MM-DD
  const dow = tzNow.getDay(); // 0..6 (0=Domingo)
  const time = tzNow.toTimeString().slice(0, 8); // HH:MM:SS

  const query = `
    SELECT * FROM promotions
    WHERE is_active = TRUE
      AND (valid_from IS NULL OR valid_from <= $1::date)
      AND (valid_to IS NULL OR valid_to >= $1::date)
      AND (
        days_of_week IS NULL OR $2 = ANY(days_of_week)
      )
      AND (
        (start_time IS NULL AND end_time IS NULL)
        OR (start_time IS NOT NULL AND end_time IS NOT NULL AND $3::time >= start_time AND $3::time <= end_time)
      )
    ORDER BY is_priority DESC, created_at DESC
    LIMIT 2;
  `;
  const { rows } = await pool.query(query, [today, dow, time]);
  return rows ?? [];
};

export const countEligiblePriorityNowService = async () => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const dow = now.getDay();
  const time = now.toTimeString().slice(0, 8);
  const q = `
    SELECT COUNT(*)::int AS c
    FROM promotions
    WHERE is_active = TRUE AND is_priority = TRUE
      AND (valid_from IS NULL OR valid_from <= $1::date)
      AND (valid_to IS NULL OR valid_to >= $1::date)
      AND (days_of_week IS NULL OR $2 = ANY(days_of_week))
      AND ((start_time IS NULL AND end_time IS NULL) OR ($3::time >= start_time AND $3::time <= end_time))
  `;
  const { rows } = await pool.query(q, [today, dow, time]);
  return rows[0]?.c ?? 0;
};

export default {
  createPromotionService,
  getPromotionsService,
  updatePromotionService,
  deletePromotionService,
  getEligiblePromotionNowService,
  countEligiblePriorityNowService,
  getPromotionByIdService,
};
