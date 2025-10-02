import React, { useEffect, useState } from "react";
import {
	createPromotion,
	updatePromotion,
	getEligiblePromotionNow,
} from "../services/promotionService";
import { uploadImages } from "../services/uploadService";
import AlertModal from "./AlertModal.jsx";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const defaultDays = [0, 1, 2, 3, 4, 5, 6];

// Variantes de animación reutilizables
const containerVariants = {
	hidden: {},
	show: {
		transition: { staggerChildren: 0.055, delayChildren: 0.05 },
	},
};
const itemVariants = {
	hidden: { opacity: 0, y: 10 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 260, damping: 22 },
	},
};

// Íconos minimalistas inline
const IconClose = (props) => (
	<svg viewBox="0 0 24 24" fill="none" width="20" height="20" {...props}>
		<path
			d="M6 6l12 12M18 6L6 18"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
	</svg>
);
const IconImage = (props) => (
	<svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
		<rect
			x="3"
			y="5"
			width="18"
			height="14"
			rx="2"
			stroke="currentColor"
			strokeWidth="1.4"
		/>
		<circle cx="9" cy="10" r="2" fill="currentColor" />
		<path
			d="M7 17l4-4 3 3 2-2 3 3"
			stroke="currentColor"
			strokeWidth="1.4"
			fill="none"
			strokeLinecap="round"
		/>
	</svg>
);
const IconCalendar = (props) => (
	<svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
		<rect
			x="3"
			y="5"
			width="18"
			height="16"
			rx="2"
			stroke="currentColor"
			strokeWidth="1.4"
		/>
		<path
			d="M8 3v4M16 3v4M3 10h18"
			stroke="currentColor"
			strokeWidth="1.4"
			strokeLinecap="round"
		/>
	</svg>
);
const IconClock = (props) => (
	<svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
		<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
		<path
			d="M12 7v6l4 2"
			stroke="currentColor"
			strokeWidth="1.4"
			strokeLinecap="round"
		/>
	</svg>
);
const IconDays = (props) => (
	<svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
		<rect
			x="3"
			y="5"
			width="18"
			height="14"
			rx="2"
			stroke="currentColor"
			strokeWidth="1.4"
		/>
		<path
			d="M7 9h10M7 13h10M7 17h6"
			stroke="currentColor"
			strokeWidth="1.4"
			strokeLinecap="round"
		/>
	</svg>
);
const IconFlag = (props) => (
	<svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
		<path
			d="M5 4v16M5 5h9l-1.5 3H19l-2 4H9l-1.5-3H5"
			stroke="currentColor"
			strokeWidth="1.4"
			strokeLinecap="round"
		/>
	</svg>
);
const IconBolt = (props) => (
	<svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
		<path
			d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
			stroke="currentColor"
			strokeWidth="1.2"
			fill="currentColor"
		/>
	</svg>
);
const IconPlus = (props) => (
	<svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
		<path
			d="M12 5v14M5 12h14"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
	</svg>
);
const IconPencil = (props) => (
	<svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
		<path
			d="M3 17.25V21h3.75L19.81 7.94l-3.75-3.75L3 17.25z"
			stroke="currentColor"
			strokeWidth="1.4"
		/>
		<path d="M14.06 4.19l3.75 3.75" stroke="currentColor" strokeWidth="1.4" />
	</svg>
);

const PromotionFormModal = ({
	promotion,
	onClose,
	onSaved,
	variant = "modal",
}) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [fileList, setFileList] = useState([]);

	const [useFixedDates, setUseFixedDates] = useState(false);
	const [validFrom, setValidFrom] = useState("");
	const [validTo, setValidTo] = useState("");

	const [useTimeWindow, setUseTimeWindow] = useState(false);
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");

	const [useSpecificDays, setUseSpecificDays] = useState(false);
	const [daysOfWeek, setDaysOfWeek] = useState(defaultDays);

	const [isActive, setIsActive] = useState(true);
	const [isPriority, setIsPriority] = useState(false);
	const [saving, setSaving] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
	const [tooManyModal, setTooManyModal] = useState({
		open: false,
		names: [],
		tone: "amber",
		title: "Aviso",
		message: "",
	});

	const isPage = variant === "page";

	// Bloquear scroll del fondo solo en modal
	useEffect(() => {
		if (isPage) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [isPage]);

	useEffect(() => {
		if (promotion) {
			setTitle(promotion.title || "");
			setDescription(promotion.description || "");
			setImageUrl(promotion.image_url || "");

			// Prefill reglas si existen
			const hasBothDates =
				Boolean(promotion.valid_from) && Boolean(promotion.valid_to);
			setUseFixedDates(hasBothDates);
			setValidFrom(promotion.valid_from || "");
			setValidTo(promotion.valid_to || "");

			if (promotion.start_time || promotion.end_time) setUseTimeWindow(true);
			setStartTime(promotion.start_time || "");
			setEndTime(promotion.end_time || "");

			if (promotion.days_of_week && promotion.days_of_week.length) {
				setUseSpecificDays(true);
				setDaysOfWeek(promotion.days_of_week);
			}

			setIsActive(Boolean(promotion.is_active));
			setIsPriority(Boolean(promotion.is_priority));
		}
	}, [promotion]);

	const handleToggleDay = (day) => {
		setDaysOfWeek((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
		);
	};

	const validateForm = () => {
		if (!title.trim()) return "El título es obligatorio";
		if (!imageUrl && (!fileList || fileList.length === 0))
			return "Debes seleccionar una imagen de la promoción";
		if (useFixedDates) {
			// Requerir ambas fechas solo si el usuario está proporcionando alguna fecha
			// o si originalmente la promo tenía ambas fechas y ahora quedarían inconsistentes
			const providingAnyDate = Boolean(validFrom) || Boolean(validTo);
			if (providingAnyDate) {
				if (!validFrom || !validTo)
					return "Debes seleccionar fecha de inicio y fin";
				if (new Date(validFrom) > new Date(validTo))
					return "La fecha de inicio no puede ser mayor que la fecha fin";
			}
		}
		if (useTimeWindow) {
			if (!startTime || !endTime) return "Debes seleccionar hora inicio y fin";
			if (startTime >= endTime)
				return "La hora de inicio debe ser menor que la de fin";
		}
		if (useSpecificDays && daysOfWeek.length === 0)
			return "Debes seleccionar al menos un día";
		return "";
	};

	const handleUpload = async () => {
		if (!fileList || fileList.length === 0) return null;
		// Usamos el título como nombre base en Azure (uploadService ya envía cocktailName)
		const urls = await uploadImages(fileList, title || "promotion");
		return urls[0] || null;
	};

	const wouldBeEligibleNow = () => {
		const now = new Date();
		const todayDow = now.getDay();
		const time = now.toTimeString().slice(0, 5);
		if (!isActive) return false;
		if (useFixedDates) {
			if (!validFrom || !validTo) return false;
			const today = now.toISOString().slice(0, 10);
			if (today < validFrom || today > validTo) return false;
		}
		if (useTimeWindow) {
			if (!startTime || !endTime) return false;
			if (!(time >= startTime && time <= endTime)) return false;
		}
		if (useSpecificDays) {
			if (!daysOfWeek.includes(todayDow)) return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMsg("");
		const error = validateForm();
		if (error) {
			setErrorMsg(error);
			return;
		}

		// Validación: no superar 2 promo elegibles simultáneamente (solo PRIORIDAD)
		try {
			const currentEligibles = await getEligiblePromotionNow();
			const willBeEligible = wouldBeEligibleNow();
			const list = Array.isArray(currentEligibles) ? currentEligibles : [];
			const eligiblePriority = list.filter((p) => p.is_priority);
			const eligiblePriorityCount = eligiblePriority.length;
			if (isPriority && willBeEligible && eligiblePriorityCount >= 2) {
				setTooManyModal({
					open: true,
					names: eligiblePriority.map((p) => p.title),
				});
				return;
			}
		} catch (_e) {
			// si falla la consulta, continuamos con el guardado
		}

		setSaving(true);
		try {
			// Subir imagen solo si el resto del formulario es válido
			let finalImageUrl = imageUrl;
			if (!finalImageUrl) {
				const uploaded = await handleUpload();
				if (!uploaded) throw new Error("No se pudo subir la imagen");
				finalImageUrl = uploaded;
			}

			const payload = {
				title,
				description,
				image_url: finalImageUrl,
				is_active: isActive,
				is_priority: isPriority,
				applicability: [],
			};

			// Incluir fechas solo si la sección está activa y ambas fechas están presentes
			if (useFixedDates && validFrom && validTo) {
				payload.valid_from = validFrom;
				payload.valid_to = validTo;
			}

			// Incluir horas solo si la sección está activa y ambas horas están presentes
			if (useTimeWindow && startTime && endTime) {
				payload.start_time = startTime;
				payload.end_time = endTime;
			}

			// Incluir días solo si la sección está activa
			if (useSpecificDays) {
				payload.days_of_week = daysOfWeek.sort((a, b) => a - b);
			}

			if (promotion) await updatePromotion(promotion.id, payload);
			else await createPromotion(payload);
			onSaved?.();
		} catch (err) {
			setErrorMsg(err.message || "Error al guardar la promoción");
		} finally {
			setSaving(false);
		}
	};

	// Contenido principal del formulario (tarjeta)
	const Card = (
		<motion.div
			initial={{ y: 20, scale: 0.98 }}
			animate={{ y: 0, scale: 1 }}
			exit={{ y: 20, scale: 0.98 }}
			transition={
				isPage
					? { type: "spring", stiffness: 220, damping: 22 }
					: { duration: 0.18 }
			}
			className={`rounded-2xl shadow-2xl w-full max-w-2xl ${
				isPage ? "max-h-[calc(100vh-2rem)]" : "max-h-[90vh]"
			} overflow-hidden flex flex-col`}
			style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
		>
			<div
				className="p-4 border-b flex items-center justify-between"
				style={{ borderColor: "#3a3a3a" }}
			>
				<div className="flex items-center gap-2">
					<motion.span
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ type: "spring", stiffness: 260, damping: 18 }}
						className={`inline-flex items-center justify-center w-9 h-9 rounded-full`}
						style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
					>
						{promotion ? <IconPencil /> : <IconPlus />}
					</motion.span>
					<motion.h2
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							type: "spring",
							stiffness: 260,
							damping: 22,
							delay: 0.05,
						}}
						className="text-xl font-bold"
						style={{ color: "#e9cc9e" }}
					>
						{promotion ? "Editar promoción" : "Nueva promoción"}
					</motion.h2>
				</div>
				<motion.button
					onClick={onClose}
					whileTap={{ scale: 0.96 }}
					className="w-8 h-8 inline-flex items-center justify-center rounded-full"
					style={{
						backgroundColor: "#2a2a2a",
						color: "#e9cc9e",
						border: "1px solid #3a3a3a",
					}}
					aria-label="Cerrar"
				>
					<IconClose />
				</motion.button>
			</div>

			<motion.form
				onSubmit={handleSubmit}
				className="flex-1 overflow-y-auto p-5 space-y-6"
				variants={containerVariants}
				initial="hidden"
				animate="show"
			>
				{errorMsg && (
					<motion.div
						variants={itemVariants}
						className="text-sm p-2.5 rounded-lg border"
						style={{
							backgroundColor: "#2a1414",
							color: "#fca5a5",
							borderColor: "#b91c1c",
						}}
					>
						{errorMsg}
					</motion.div>
				)}

				<motion.div variants={itemVariants} className="grid grid-cols-1 gap-4">
					<div>
						<label
							className="block text-sm font-medium mb-1"
							style={{ color: "#e9cc9e" }}
						>
							Título <span className="text-red-600">*</span>
						</label>
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Ej. 2x1 en cócteles"
							className="w-full rounded-xl px-3 py-2.5 focus:outline-none placeholder:text-[#b8b8b8]"
							style={{
								backgroundColor: "#2a2a2a",
								color: "#e9cc9e",
								border: "1px solid #3a3a3a",
							}}
							required
						/>
					</div>
					<div>
						<label
							className="block text-sm font-medium mb-1"
							style={{ color: "#e9cc9e" }}
						>
							Descripción
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Texto que verán los clientes"
							className="w-full rounded-xl px-3 py-2.5 focus:outline-none placeholder:text-[#b8b8b8]"
							style={{
								backgroundColor: "#2a2a2a",
								color: "#e9cc9e",
								border: "1px solid #3a3a3a",
							}}
							rows={3}
						/>
					</div>
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#e9cc9e" }}
						>
							<span className="inline-flex items-center gap-2">
								<IconImage style={{ color: "#e9cc9e" }} /> Imagen de la
								promoción <span className="text-red-600">*</span>
							</span>
						</label>
						<div className="flex items-center gap-3">
							<input
								type="file"
								accept="image/*"
								onChange={(e) => setFileList(e.target.files)}
								className="block text-sm"
							/>
						</div>
						{(imageUrl || (fileList && fileList.length > 0)) && (
							<div className="mt-3">
								<div className="text-xs mb-1" style={{ color: "#b8b8b8" }}>
									Vista previa
								</div>
								<img
									src={imageUrl || URL.createObjectURL(fileList[0])}
									alt="promo"
									className="w-full max-h-64 object-contain rounded-lg bg-black"
								/>
							</div>
						)}
						<p className="text-xs mt-1" style={{ color: "#9a9a9a" }}>
							La imagen se subirá a Azure usando el título como nombre base.
						</p>
					</div>
				</motion.div>

				<motion.div variants={itemVariants} className="border-t pt-4">
					<motion.button
						type="button"
						onClick={() => setUseFixedDates((v) => !v)}
						className="flex items-center gap-2 mb-3"
						style={{ color: "#e9cc9e" }}
						whileTap={{ scale: 0.98 }}
					>
						<span
							className="w-8 h-8 inline-flex items-center justify-center rounded-full"
							style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
						>
							<IconCalendar />
						</span>
						<span className="font-medium">Fecha fija (opcional)</span>
					</motion.button>
					{useFixedDates && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700">
									Desde (fecha)
								</label>
								<input
									type="date"
									value={validFrom}
									onChange={(e) => setValidFrom(e.target.value)}
									className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700">
									Hasta (fecha)
								</label>
								<input
									type="date"
									value={validTo}
									onChange={(e) => setValidTo(e.target.value)}
									className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
								/>
							</div>
						</div>
					)}
				</motion.div>

				<motion.div variants={itemVariants} className="border-t pt-4">
					<motion.button
						type="button"
						onClick={() => setUseTimeWindow((v) => !v)}
						className="flex items-center gap-2 mb-3"
						style={{ color: "#e9cc9e" }}
						whileTap={{ scale: 0.98 }}
					>
						<span
							className="w-8 h-8 inline-flex items-center justify-center rounded-full"
							style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
						>
							<IconClock />
						</span>
						<span className="font-medium">Horas específicas (opcional)</span>
					</motion.button>
					{useTimeWindow && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700">
									Inicio (hora)
								</label>
								<input
									type="time"
									value={startTime}
									onChange={(e) => setStartTime(e.target.value)}
									className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700">
									Fin (hora)
								</label>
								<input
									type="time"
									value={endTime}
									onChange={(e) => setEndTime(e.target.value)}
									className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
								/>
							</div>
						</div>
					)}
				</motion.div>

				<motion.div variants={itemVariants} className="border-t pt-4">
					<motion.button
						type="button"
						onClick={() => setUseSpecificDays((v) => !v)}
						className="flex items-center gap-2 mb-3"
						style={{ color: "#e9cc9e" }}
						whileTap={{ scale: 0.98 }}
					>
						<span
							className="w-8 h-8 inline-flex items-center justify-center rounded-full"
							style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
						>
							<IconDays />
						</span>
						<span className="font-medium">Días específicos (opcional)</span>
					</motion.button>
					{useSpecificDays && (
						<div>
							<div className="flex flex-wrap gap-2">
								{[
									{ d: 0, l: "Dom" },
									{ d: 1, l: "Lun" },
									{ d: 2, l: "Mar" },
									{ d: 3, l: "Mié" },
									{ d: 4, l: "Jue" },
									{ d: 5, l: "Vie" },
									{ d: 6, l: "Sáb" },
								].map(({ d, l }) => (
									<motion.button
										type="button"
										key={d}
										onClick={() => handleToggleDay(d)}
										className={`px-3 py-1.5 rounded-full border text-sm ${
											daysOfWeek.includes(d)
												? "bg-green-600 text-white border-green-600"
												: "border-gray-300 text-gray-700"
										}`}
										whileTap={{ scale: 0.97 }}
									>
										{l}
									</motion.button>
								))}
							</div>
							<p className="text-xs text-gray-500 mt-1">
								Si no eliges días, la promoción aplica todos los días.
							</p>
						</div>
					)}
				</motion.div>

				<motion.div
					variants={itemVariants}
					className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4"
				>
					<motion.button
						type="button"
						onClick={() => setIsActive((v) => !v)}
						className={`flex items-center justify-between w-full px-3 py-2 rounded-lg border`}
						style={{
							backgroundColor: "#2a2a2a",
							borderColor: "#3a3a3a",
							color: "#e9cc9e",
						}}
						whileTap={{ scale: 0.98 }}
					>
						<span className="inline-flex items-center gap-2 text-sm">
							<span
								className="w-8 h-8 inline-flex items-center justify-center rounded-full"
								style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
							>
								<IconFlag />
							</span>
							Activa
						</span>
						<span
							className="inline-block h-5 w-10 rounded-full transition-colors"
							style={{
								backgroundColor: isActive ? "#e9cc9e" : "#3a3a3a",
								border: "1px solid #3a3a3a",
							}}
						>
							<span
								className={`block h-5 w-5 rounded-full transform transition-transform ${
									isActive ? "translate-x-5" : "translate-x-0"
								}`}
								style={{ backgroundColor: "#191919" }}
							/>
						</span>
					</motion.button>

					<motion.button
						type="button"
						onClick={() => setIsPriority((v) => !v)}
						className={`flex items-center justify-between w-full px-3 py-2 rounded-lg border`}
						style={{
							backgroundColor: "#2a2a2a",
							borderColor: "#3a3a3a",
							color: "#e9cc9e",
						}}
						whileTap={{ scale: 0.98 }}
					>
						<span className="inline-flex items-center gap-2 text-sm">
							<span
								className="w-8 h-8 inline-flex items-center justify-center rounded-full"
								style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
							>
								<IconBolt />
							</span>
							Alta prioridad
						</span>
						<span
							className="inline-block h-5 w-10 rounded-full transition-colors"
							style={{
								backgroundColor: isPriority ? "#e9cc9e" : "#3a3a3a",
								border: "1px solid #3a3a3a",
							}}
						>
							<span
								className={`block h-5 w-5 rounded-full transform transition-transform ${
									isPriority ? "translate-x-5" : "translate-x-0"
								}`}
								style={{ backgroundColor: "#191919" }}
							/>
						</span>
					</motion.button>
				</motion.div>

				<motion.div
					variants={itemVariants}
					className="flex justify-end gap-2 pt-2"
				>
					<motion.button
						type="button"
						onClick={onClose}
						className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
						whileTap={{ scale: 0.98 }}
					>
						Cancelar
					</motion.button>
					<motion.button
						disabled={saving}
						type="submit"
						className="px-4 py-2 rounded-md bg-green-700 text-white hover:bg-green-800"
						whileTap={{ scale: 0.98 }}
					>
						{saving ? "Guardando..." : "Guardar"}
					</motion.button>
				</motion.div>
			</motion.form>
		</motion.div>
	);

	if (isPage) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 12 }}
				className="min-h-screen p-4 sm:p-6 flex items-start justify-center"
			>
				{Card}
				<AlertModal
					isOpen={tooManyModal.open}
					title={tooManyModal.title}
					message={tooManyModal.message}
					items={tooManyModal.names}
					tone={tooManyModal.tone}
					onClose={() => setTooManyModal((s) => ({ ...s, open: false }))}
				/>
			</motion.div>
		);
	}

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
			>
				{Card}
				<AlertModal
					isOpen={tooManyModal.open}
					title={tooManyModal.title}
					message={tooManyModal.message}
					items={tooManyModal.names}
					tone={tooManyModal.tone}
					onClose={() => setTooManyModal((s) => ({ ...s, open: false }))}
				/>
			</motion.div>
		</AnimatePresence>
	);
};

export default PromotionFormModal;
