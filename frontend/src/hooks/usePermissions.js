import { useMemo } from "react";

// Función para obtener el rol del usuario desde localStorage
const getUserRole = () => {
	const role = localStorage.getItem("role") || "admin";
	console.log("usePermissions - Rol detectado:", role);
	return role;
};

// Hook para verificar permisos del usuario
export const usePermissions = () => {
	console.log("usePermissions - Hook ejecutándose...");
	const userRole = getUserRole();

	const permissions = useMemo(() => {
		console.log("usePermissions - Generando permisos para rol:", userRole);
		const perms = {
			// Dashboard - Todos los roles tienen acceso
			canAccessDashboard: true,

			// Bebidas - Solo admin, ventas y barmanager
			canAccessBeverages: ["admin", "ventas", "barmanager"].includes(userRole),
			canCreateBeverages: ["admin", "ventas", "barmanager"].includes(userRole),
			canEditBeverages: ["admin", "ventas", "barmanager"].includes(userRole),
			canDeleteBeverages: ["admin", "ventas", "barmanager"].includes(userRole), // Barmanager puede eliminar bebidas

			// Comida - Solo admin, ventas y chef
			canAccessFood: ["admin", "ventas", "chef"].includes(userRole),
			canCreateFood: ["admin", "ventas", "chef"].includes(userRole),
			canEditFood: ["admin", "ventas", "chef"].includes(userRole),
			canDeleteFood: ["admin", "ventas", "chef"].includes(userRole), // Chef puede eliminar platos

			// Categorías - Todos los roles pueden hacer CRUD completo
			canAccessCategories: true,
			canCreateCategories: ["admin", "ventas", "chef", "barmanager"].includes(
				userRole
			),
			canEditCategories: ["admin", "ventas", "chef", "barmanager"].includes(
				userRole
			),
			canDeleteCategories: ["admin", "ventas", "chef", "barmanager"].includes(
				userRole
			),

			// Usuarios - Solo admin y ventas
			canAccessUsers: ["admin", "ventas"].includes(userRole),
			canCreateUsers: ["admin", "ventas"].includes(userRole),
			canEditUsers: ["admin", "ventas"].includes(userRole),
			canDeleteUsers: ["admin", "ventas"].includes(userRole),

			// Promociones - Todos los roles pueden ver, solo admin y ventas pueden editar
			canAccessPromotions: true,
			canCreatePromotions: ["admin", "ventas"].includes(userRole),
			canEditPromotions: ["admin", "ventas"].includes(userRole),
			canDeletePromotions: ["admin", "ventas"].includes(userRole),

			// Upload de imágenes - Admin, ventas, chef y barmanager pueden subir
			canUploadImages: ["admin", "ventas", "chef", "barmanager"].includes(
				userRole
			),
		};

		console.log(
			"usePermissions - Permisos generados para rol",
			userRole,
			":",
			perms
		);
		return perms;
	}, [userRole]);

	return {
		userRole,
		permissions,
		hasPermission: (permission) => permissions[permission] || false,
	};
};
