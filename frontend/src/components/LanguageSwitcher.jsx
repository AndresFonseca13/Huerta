import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiGlobe, FiCheck } from "react-icons/fi";

/**
 * Componente visual para cambiar el idioma
 * Muestra un botón con ícono de globo y banderas de idiomas
 */
const LanguageSwitcher = () => {
	const { i18n, t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	const languages = [
		{ code: "es", name: "Español", flag: "🇨🇴" },
		{ code: "en", name: "English", flag: "🇺🇸" },
	];

	const currentLanguage =
		languages.find((lang) => lang.code === i18n.language) || languages[0];

	const changeLanguage = (langCode) => {
		i18n.changeLanguage(langCode);
		setIsOpen(false);
		console.log("🌍 Language changed to:", langCode);
	};

	return (
		<div className="relative z-50">
			{/* Botón principal */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
				style={{
					backgroundColor: "#2a2a2a",
					border: "1px solid #3a3a3a",
					color: "#e9cc9e",
				}}
				aria-label={t("changeLanguage")}
			>
				<FiGlobe size={20} />
				<span className="text-2xl">{currentLanguage.flag}</span>
				<span className="hidden md:inline text-sm font-medium">
					{currentLanguage.name}
				</span>
			</button>

			{/* Dropdown de idiomas */}
			{isOpen && (
				<>
					{/* Overlay para cerrar al hacer clic fuera */}
					<div
						className="fixed inset-0 z-[9998]"
						onClick={() => setIsOpen(false)}
					/>

					{/* Menu */}
					<div
						className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl overflow-hidden z-[9999]"
						style={{
							backgroundColor: "#2a2a2a",
							border: "1px solid #3a3a3a",
						}}
					>
						<div
							className="px-4 py-2 border-b"
							style={{ borderColor: "#3a3a3a" }}
						>
							<p
								className="text-xs font-semibold uppercase"
								style={{ color: "#b8b8b8" }}
							>
								{t("changeLanguage")}
							</p>
						</div>

						{languages.map((lang) => (
							<button
								key={lang.code}
								onClick={() => changeLanguage(lang.code)}
								className="w-full flex items-center justify-between px-4 py-3 transition-colors"
								style={{
									backgroundColor:
										i18n.language === lang.code ? "#3a3a3a" : "transparent",
									color: "#e9cc9e",
								}}
								onMouseEnter={(e) => {
									if (i18n.language !== lang.code) {
										e.currentTarget.style.backgroundColor = "#353535";
									}
								}}
								onMouseLeave={(e) => {
									if (i18n.language !== lang.code) {
										e.currentTarget.style.backgroundColor = "transparent";
									}
								}}
							>
								<div className="flex items-center space-x-3">
									<span className="text-2xl">{lang.flag}</span>
									<span className="text-sm font-medium">{lang.name}</span>
								</div>
								{i18n.language === lang.code && (
									<FiCheck size={18} style={{ color: "#22c55e" }} />
								)}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default LanguageSwitcher;
