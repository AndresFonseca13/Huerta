import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PromotionFormModal from "../components/PromotionFormModal.jsx";
import { getPromotionById } from "../services/promotionService.js";

const PromotionEditor = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const location = useLocation();
	const [promotion, setPromotion] = useState(location.state?.promotion || null);
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	useEffect(() => {
		if (!promotion && isEdit) {
			setLoading(true);
			getPromotionById(id)
				.then((p) => setPromotion(p))
				.catch(() => {})
				.finally(() => setLoading(false));
		}
	}, [id, isEdit, promotion]);

	return (
		<div className="min-h-screen" style={{ backgroundColor: "#191919" }}>
			{loading ? (
				<div className="p-6" style={{ color: "#b8b8b8" }}>
					Cargando promoción...
				</div>
			) : (
				<PromotionFormModal
					variant="page"
					promotion={promotion}
					onClose={() => navigate(-1)}
					onSaved={() => navigate("/admin/promotions")}
				/>
			)}
		</div>
	);
};

export default PromotionEditor;
