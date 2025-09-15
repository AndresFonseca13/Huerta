import React, { useEffect, useState, useMemo } from "react";
import {
	listPromotions,
	deletePromotion,
	updatePromotion,
	getEligiblePromotionNow,
} from "../services/promotionService";
import { useNavigate } from "react-router-dom";
import PromotionEntryModal from "../components/PromotionEntryModal.jsx";
import AlertModal from "../components/AlertModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";

const TrashIcon = ({ className = "" }) => (
	<svg
		className={className}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
	>
		<path
			d="M3 6h18"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
		<path
			d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
		<path
			d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"
			stroke="currentColor"
			strokeWidth="1.8"
		/>
		<path
			d="M10 10v8M14 10v8"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
	</svg>
);

const SwitchSm = ({ checked, onChange }) => (
	<button
		onClick={onChange}
		className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors ${
			checked ? "bg-green-600" : "bg-gray-300"
		}`}
	>
		<span
			className={`transform transition-transform inline-block w-5 h-5 bg-white rounded-full shadow ${
				checked ? "translate-x-5" : "translate-x-0"
			}`}
		/>
	</button>
);

const StatCard = ({
	label,
	count,
	tone = "green",
	active = false,
	onClick,
}) => {
	const toneMap = {
		green: {
			card: active ? "border-green-300 bg-green-50" : "border-gray-200",
			badge: "bg-green-100 text-green-700",
		},
		blue: {
			card: active ? "border-blue-300 bg-blue-50" : "border-gray-200",
			badge: "bg-blue-100 text-blue-700",
		},
		amber: {
			card: active ? "border-amber-300 bg-amber-50" : "border-gray-200",
			badge: "bg-amber-100 text-amber-700",
		},
	};
	const t = toneMap[tone] || toneMap.green;
	return (
		<button
			onClick={onClick}
			className={`text-left w-full rounded-2xl border ${t.card} shadow-sm px-4 py-3 hover:brightness-95 transition`}
		>
			<div className="text-sm text-gray-600">{label}</div>
			<div
				className={`inline-flex mt-2 px-3 py-1 rounded-full text-sm font-semibold ${t.badge}`}
			>
				{count}
			</div>
		</button>
	);
};

const Badge = ({ children, tone = "gray" }) => {
	const tones = {
		gray: "bg-gray-100 text-gray-700 border-gray-200",
		green: "bg-green-50 text-green-700 border-green-200",
		blue: "bg-blue-50 text-blue-700 border-blue-200",
		amber: "bg-amber-50 text-amber-700 border-amber-200",
	};
	return (
		<span
			className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${
				tones[tone] || tones.gray
			}`}
		>
			{children}
		</span>
	);
};

const formatDate = (iso) => {
	if (!iso) return "";
	const dateOnly = iso.length > 10 ? iso.slice(0, 10) : iso;
	const parts = dateOnly.split("-");
	const m = parts[1];
	const d = parts[2];
	return `${d}/${m}`;
};

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const formatDays = (arr) => {
	if (!Array.isArray(arr) || arr.length === 0) return "";
	const sorted = [...arr].sort((a, b) => a - b);
	const workdays =
		[1, 2, 3, 4, 5].every((d) => sorted.includes(d)) && sorted.length === 5;
	const weekend =
		[0, 6].every((d) => sorted.includes(d)) && sorted.length === 2;
	if (workdays) return "Lun–Vie";
	if (weekend) return "Fines de semana";
	return sorted.map((d) => dayNames[d]).join(" · ");
};

const isAlwaysActive = (p) => {
	const hasDates = !!(p.valid_from || p.valid_to);
	const hasTime = !!(p.start_time && p.end_time);
	const hasDays = Array.isArray(p.days_of_week) && p.days_of_week.length > 0;
	return p.is_active && !hasDates && !hasTime && !hasDays;
};

const isNowWithin = (p) => {
	const now = new Date();
	const today = now.toISOString().slice(0, 10);
	const time = now.toTimeString().slice(0, 5);
	const dow = now.getDay();
	if (p.valid_from && today < p.valid_from) return false;
	if (p.valid_to && today > p.valid_to) return false;
	if (
		Array.isArray(p.days_of_week) &&
		p.days_of_week.length > 0 &&
		!p.days_of_week.includes(dow)
	)
		return false;
	if (p.start_time && p.end_time) {
		if (!(time >= p.start_time.slice(0, 5) && time <= p.end_time.slice(0, 5)))
			return false;
	}
	return true;
};

const PromotionsAdmin = () => {
	const [promotions, setPromotions] = useState([]);
	const [pagination, setPagination] = useState({
		totalPages: 0,
		currentPage: 1,
		totalRecords: 0,
	});
	const [isLoading, setIsLoading] = useState(false);
	// formulario ahora es página dedicada
	const [previewPromotion, setPreviewPromotion] = useState(null);
	const [alertTooMany, setAlertTooMany] = useState({ open: false, names: [] });
	const [confirmDelete, setConfirmDelete] = useState({
		open: false,
		promo: null,
	});
	const [successAlert, setSuccessAlert] = useState({ open: false, names: [] });
	const [filter, setFilter] = useState("all"); // all | active | inactive | priority | current

	const navigate = useNavigate();

	const fetchData = async (page = 1) => {
		setIsLoading(true);
		try {
			const data = await listPromotions(page, 12);
			setPromotions(data.promotions || []);
			setPagination(
				data.pagination || { totalPages: 0, currentPage: 1, totalRecords: 0 }
			);
		} catch (e) {
			console.error(e);
			alert(e.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData(1);
	}, []);

	const counts = useMemo(() => {
		const total = promotions.length;
		const active = promotions.filter((p) => p.is_active).length;
		const inactive = promotions.filter((p) => !p.is_active).length;
		const priority = promotions.filter((p) => p.is_priority).length;
		const current = promotions.filter(
			(p) => p.is_active && isNowWithin(p)
		).length;
		return { total, active, inactive, priority, current };
	}, [promotions]);

	const filtered = useMemo(() => {
		if (filter === "active") return promotions.filter((p) => p.is_active);
		if (filter === "inactive") return promotions.filter((p) => !p.is_active);
		if (filter === "priority") return promotions.filter((p) => p.is_priority);
		if (filter === "current")
			return promotions.filter((p) => p.is_active && isNowWithin(p));
		return promotions;
	}, [filter, promotions]);

	const handleCreate = () => {
		navigate("/admin/promotions/create");
	};

	const handleEdit = (promotion) => {
		navigate(`/admin/promotions/${promotion.id}/edit`, {
			state: { promotion },
		});
	};

	const handleDelete = async () => {
		if (!confirmDelete.promo) return;
		try {
			await deletePromotion(confirmDelete.promo.id);
			setConfirmDelete({ open: false, promo: null });
			setSuccessAlert({ open: true, names: [confirmDelete.promo.title] });
			await fetchData(pagination.currentPage);
		} catch (e) {
			alert(e.message);
		}
	};

	const checkTooManyPriorityNow = async (candidate) => {
		try {
			const eligibles = await getEligiblePromotionNow();
			const list = Array.isArray(eligibles) ? eligibles : [];
			const priorityEligibles = list.filter((p) => p.is_priority);
			const willBeEligible = isNowWithin(candidate) && candidate.is_active;
			if (
				candidate.is_priority &&
				willBeEligible &&
				priorityEligibles.length >= 2
			) {
				setAlertTooMany({
					open: true,
					names: priorityEligibles.map((p) => p.title),
				});
				return true;
			}
			return false;
		} catch (_e) {
			return false;
		}
	};

	const toggleActive = async (p) => {
		try {
			const next = { ...p, is_active: !p.is_active };
			if (next.is_priority) {
				const blocked = await checkTooManyPriorityNow(next);
				if (blocked) return;
			}
			const updated = await updatePromotion(p.id, {
				is_active: next.is_active,
			});
			setPromotions((prev) =>
				prev.map((it) =>
					it.id === p.id ? { ...it, is_active: updated.is_active } : it
				)
			);
		} catch (e) {
			let payload;
			try {
				payload = JSON.parse(e.message);
			} catch (_) {
				/* ignore */
			}
			if (payload?.code === "ACTIVE_OVERLAP_LIMIT") {
				setAlertTooMany({ open: true, names: payload.promociones || [] });
				return;
			}
			alert(e.message);
		}
	};

	const togglePriority = async (p) => {
		try {
			const next = { ...p, is_priority: !p.is_priority };
			const blocked = await checkTooManyPriorityNow(next);
			if (blocked) return;
			const updated = await updatePromotion(p.id, {
				is_priority: next.is_priority,
			});
			setPromotions((prev) =>
				prev.map((it) =>
					it.id === p.id ? { ...it, is_priority: updated.is_priority } : it
				)
			);
		} catch (e) {
			try {
				const data = JSON.parse(e.message);
				if (data.code === "PRIORITY_LIMIT") {
					setAlertTooMany({ open: true, names: [] });
					return;
				}
			} catch (_) {
				/* ignore */
			}
			alert(e.message);
		}
	};

	return (
		<div className="p-6 pb-24">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
				<h1 className="text-2xl font-bold text-gray-900">Promociones</h1>
				<button
					onClick={handleCreate}
					className="w-full sm:w-auto inline-flex items-center justify-center bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md text-sm"
				>
					Nueva promoción
				</button>
			</div>

			{/* Contadores estilo cards para filtrar */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
				<StatCard
					label="Total"
					count={counts.total}
					tone="green"
					active={filter === "all"}
					onClick={() => setFilter("all")}
				/>
				<StatCard
					label="Activos"
					count={counts.active}
					tone="blue"
					active={filter === "active"}
					onClick={() => setFilter("active")}
				/>
				<StatCard
					label="Inactivos"
					count={counts.inactive}
					tone="amber"
					active={filter === "inactive"}
					onClick={() => setFilter("inactive")}
				/>
			</div>

			{isLoading ? (
				<div className="text-gray-600">Cargando...</div>
			) : filtered.length === 0 ? (
				<div className="text-gray-600">
					No hay promociones para este filtro.
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{filtered.map((p) => (
						<div
							key={p.id}
							className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col"
						>
							<div className="flex items-start gap-3">
								<div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
									{p.image_url ? (
										<img
											src={p.image_url}
											alt={p.title}
											className="w-full h-full object-cover"
										/>
									) : (
										<span className="text-xs text-gray-400">Sin imagen</span>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between">
										<h3 className="font-semibold text-gray-900 truncate">
											{p.title}
										</h3>
										<button
											onClick={() => setConfirmDelete({ open: true, promo: p })}
											className="text-red-600 hover:text-red-700"
											title="Eliminar"
										>
											<TrashIcon />
										</button>
									</div>
									<div className="mt-2 flex flex-wrap gap-2">
										{p.is_priority && <Badge tone="amber">Prioridad</Badge>}
										{p.valid_from || p.valid_to ? (
											<Badge tone="blue">{`${formatDate(p.valid_from) || ""}${
												p.valid_from && p.valid_to ? "–" : ""
											}${formatDate(p.valid_to) || ""}`}</Badge>
										) : null}
										{p.start_time && p.end_time && (
											<Badge tone="blue">{`${p.start_time.slice(
												0,
												5
											)}–${p.end_time.slice(0, 5)}`}</Badge>
										)}
										{Array.isArray(p.days_of_week) &&
											p.days_of_week.length > 0 && (
												<Badge>{formatDays(p.days_of_week)}</Badge>
											)}
										{p.is_active && isNowWithin(p) && (
											<Badge tone="green">Vigente ahora</Badge>
										)}
										{isAlwaysActive(p) && (
											<Badge tone="green">Siempre activo</Badge>
										)}
									</div>
									{p.description && (
										<p className="text-sm text-gray-600 mt-2 line-clamp-2">
											{p.description}
										</p>
									)}
								</div>
							</div>

							<div className="mt-4 grid grid-cols-2 gap-3 items-center">
								<div className="flex items-center gap-2">
									<span className="text-xs text-gray-500">Activa</span>
									<SwitchSm
										checked={!!p.is_active}
										onChange={() => toggleActive(p)}
									/>
								</div>
								<div className="flex items-center gap-2 justify-end">
									<span className="text-xs text-gray-500">Prioridad</span>
									<SwitchSm
										checked={!!p.is_priority}
										onChange={() => togglePriority(p)}
									/>
								</div>
							</div>

							<div className="mt-4 flex items-center gap-2">
								<button
									onClick={() => setPreviewPromotion(p)}
									className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-sm"
								>
									Previsualizar
								</button>
								<button
									onClick={() => handleEdit(p)}
									className="px-3 py-1.5 rounded-md bg-green-700 text-white hover:bg-green-800 text-sm"
								>
									Editar
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{pagination.totalPages > 1 && (
				<div className="mt-4 flex gap-2">
					{Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
						(page) => (
							<button
								key={page}
								onClick={() => fetchData(page)}
								className={`px-3 py-1 rounded ${
									page === pagination.currentPage
										? "bg-green-700 text-white"
										: "border border-gray-300"
								}`}
							>
								{page}
							</button>
						)
					)}
				</div>
			)}

			{previewPromotion && (
				<PromotionEntryModal
					promotion={previewPromotion}
					onClose={() => setPreviewPromotion(null)}
				/>
			)}

			{confirmDelete.open && (
				<ConfirmModal
					isOpen={confirmDelete.open}
					title="¿Eliminar definitivamente?"
					message={`Esta acción eliminará permanentemente la promoción "${confirmDelete.promo?.title}" y no se puede deshacer.`}
					onClose={() => setConfirmDelete({ open: false, promo: null })}
					onConfirm={handleDelete}
					confirmText="Eliminar Definitivamente"
				/>
			)}

			{successAlert.open && (
				<AlertModal
					title="Promoción eliminada"
					message={`Se eliminó "${successAlert.names[0]}" correctamente.`}
					onClose={() => setSuccessAlert({ open: false, names: [] })}
				/>
			)}

			{alertTooMany.open && (
				<AlertModal
					title={
						alertTooMany.names?.length
							? "Límite alcanzado"
							: "Límite de prioridad"
					}
					message={
						alertTooMany.names?.length
							? "Ya hay 2 promociones vigentes en este momento. Desactiva alguna para activar otra."
							: "Ya hay 2 promociones prioritarias vigentes ahora. Deshabilita una para priorizar otra."
					}
					items={alertTooMany.names || []}
					onClose={() => setAlertTooMany({ open: false, names: [] })}
				/>
			)}
		</div>
	);
};

export default PromotionsAdmin;
