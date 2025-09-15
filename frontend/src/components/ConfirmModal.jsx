import React from "react";

const ConfirmModal = ({
	isOpen = false,
	title = "Confirmar",
	message,
	onConfirm,
	onCancel,
	onClose,
	confirmText = "Confirmar",
	cancelText = "Cancelar",
}) => {
	const handleCancel = onCancel || onClose || (() => {});
	const handleConfirm = onConfirm || (() => {});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
				<div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						className="w-7 h-7 text-red-600"
					>
						<path
							d="M12 8v5"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
						/>
						<circle cx="12" cy="16.5" r="1" fill="currentColor" />
						<path
							d="M10.29 3.86 1.82 18.02A2 2 0 0 0 3.55 21h16.9a2 2 0 0 0 1.73-2.98L13.71 3.86a2 2 0 0 0-3.42 0Z"
							stroke="currentColor"
							strokeWidth="1.2"
						/>
					</svg>
				</div>
				<h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
				{message ? (
					<p className="mt-2 text-sm text-gray-600">{message}</p>
				) : null}
				<div className="mt-6 flex items-center justify-center gap-3">
					<button
						onClick={handleCancel}
						className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
					>
						{cancelText}
					</button>
					<button
						onClick={handleConfirm}
						className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
