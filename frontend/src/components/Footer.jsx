import React from "react";
import { FiInstagram, FiMapPin, FiExternalLink } from "react-icons/fi";
import { FaWhatsapp, FaTripadvisor } from "react-icons/fa";
import logo from "../assets/logo huerta .png";

const Footer = () => {
	return (
		<footer
			className="py-10 px-4 mt-12"
			style={{ backgroundColor: "#121212", borderTop: "1px solid #3a3a3a" }}
		>
			<div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
				{/* Logo y Eslogan */}
				<div className="flex flex-col md:flex-row items-center md:items-center text-center md:text-left w-full md:w-auto gap-2 md:gap-8">
					<img
						src={logo}
						alt="Logo Huerta"
						className="h-36 md:h-28 mb-1 md:mb-0 block"
						style={{
							width: "auto",
							objectFit: "contain",
							objectPosition: "center",
						}}
					/>
					<div className="flex flex-col items-center md:items-start justify-center">
						<h1
							className="text-3xl md:text-4xl mb-1 md:mb-2 leading-none"
							style={{
								fontFamily: "'Cinzel', serif",
								fontWeight: 800,
								color: "#e9cc9e",
								letterSpacing: "0.5px",
							}}
						>
							Huerta
						</h1>
						<p
							className="text-xl md:text-2xl mb-1 md:mb-2"
							style={{
								letterSpacing: "0.5px",
								fontFamily: "'Cinzel', serif",
								fontWeight: 800,
								color: "#e9cc9e",
							}}
						>
							Cambiando el mundo un coctel a la vez
						</p>
						<div
							className="flex items-center gap-2 mb-1"
							style={{ color: "#b8b8b8" }}
						>
							<FiMapPin
								className="inline-block text-lg md:text-xl"
								style={{ color: "#e9cc9e" }}
							/>
							<span className="text-base md:text-lg">
								Cra. 12a #83-64, Bogotá
							</span>
						</div>
					</div>
				</div>

				{/* Links de Redes y Links útiles */}
				<div className="flex flex-col items-center md:items-end justify-center gap-4 w-full md:w-auto">
					<div className="flex gap-6 mb-2">
						<a
							href="https://wa.me/573053333333"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-colors text-3xl md:text-4xl"
							style={{ color: "#e9cc9e" }}
							onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
							onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
							title="WhatsApp"
						>
							<FaWhatsapp />
						</a>
						<a
							href="https://www.instagram.com/huertabarbog/?hl=es-la"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-colors text-3xl md:text-4xl"
							style={{ color: "#e9cc9e" }}
							onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
							onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
							title="Instagram"
						>
							<FiInstagram />
						</a>
						<a
							href="https://www.tripadvisor.co/Attraction_Review-g294074-d10440409-Reviews-Huerta_Cocteleria_Artesanal-Bogota.html"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-colors text-3xl md:text-4xl"
							style={{ color: "#e9cc9e" }}
							onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
							onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
							title="Tripadvisor"
						>
							<FaTripadvisor />
						</a>
						<a
							href="https://fiweex.com/links/huertabar"
							target="_blank"
							rel="noopener noreferrer"
							className="transition-colors text-3xl md:text-4xl"
							style={{ color: "#e9cc9e" }}
							onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
							onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
							title="Links Huerta"
						>
							<FiExternalLink />
						</a>
					</div>
					<div className="text-xs" style={{ color: "#b8b8b8" }}>
						&copy; {new Date().getFullYear()} Huerta Coctelería Artesanal. Todos
						los derechos reservados.
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
