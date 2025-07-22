import React from "react";
import { FiInstagram, FiMapPin, FiExternalLink } from "react-icons/fi";
import { FaWhatsapp, FaTripadvisor } from "react-icons/fa";
import logo from "../assets/Logo mejorado.png";

const Footer = () => {
	return (
		<footer className="bg-green-900 text-white py-10 px-4 mt-12 border-t border-green-800">
			<div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
				{/* Logo y Eslogan */}
				<div className="flex flex-col md:flex-row items-center md:items-center text-center md:text-left w-full md:w-auto gap-2 md:gap-8">
					<img
						src={logo}
						alt="Logo Huerta"
						className="h-32 md:h-24 mb-1 md:mb-0"
						style={{ width: "auto", objectFit: "contain" }}
					/>
					<div className="flex flex-col items-center md:items-start justify-center">
						<p
							className="text-xl md:text-2xl font-bold italic text-green-100 mb-1 md:mb-2"
							style={{
								letterSpacing: "0.5px",
								fontFamily: "'Playfair Display', serif",
							}}
						>
							Cambiando el mundo un coctel a la vez
						</p>
						<div className="flex items-center gap-2 text-green-200 mb-1">
							<FiMapPin className="inline-block text-lg md:text-xl" />
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
							href="https://wa.me/573053333333" // Cambia por el número real si lo tienes
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-yellow-200 transition-colors text-3xl md:text-4xl"
							title="WhatsApp"
						>
							<FaWhatsapp className="text-white" />
						</a>
						<a
							href="https://www.instagram.com/huertabarbog/?hl=es-la"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-yellow-200 transition-colors text-3xl md:text-4xl"
							title="Instagram"
						>
							<FiInstagram className="text-white" />
						</a>
						<a
							href="https://www.tripadvisor.co/Attraction_Review-g294074-d10440409-Reviews-Huerta_Cocteleria_Artesanal-Bogota.html"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-yellow-200 transition-colors text-3xl md:text-4xl"
							title="Tripadvisor"
						>
							<FaTripadvisor className="text-white" />
						</a>
						<a
							href="https://fiweex.com/links/huertabar"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-yellow-200 transition-colors text-3xl md:text-4xl"
							title="Links Huerta"
						>
							<FiExternalLink className="text-white" />
						</a>
					</div>
					<div className="text-xs text-green-200">
						&copy; {new Date().getFullYear()} Huerta Coctelería Artesanal. Todos
						los derechos reservados.
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
