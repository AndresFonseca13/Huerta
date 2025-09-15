import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
	getUsers,
	updateUserRole,
	createUser,
	updateUserStatus as updateUserStatusApi,
	deleteUser as deleteUserApi,
} from "../services/userService";
import {
	FiUserPlus,
	FiX,
	FiTrash2,
	FiEdit2,
	FiShield,
	FiSearch,
	FiChevronDown,
	FiCheck,
	FiUser,
	FiLock,
} from "react-icons/fi";
import axios from "axios"; // eslint-disable-line no-unused-vars

const ROLES = ["admin", "ventas", "chef", "barmanager"];

const UsersAdmin = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState("");

	const [newUser, setNewUser] = useState({
		username: "",
		password: "",
		role: "ventas",
	});
	const [creating, setCreating] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [statusFilter, setStatusFilter] = useState("all");
	const [confirmId, setConfirmId] = useState(null);
	const [editUser, setEditUser] = useState(null);
	const [editRole, setEditRole] = useState("ventas");
	const [editActive, setEditActive] = useState(true);
	const [savingEdit, setSavingEdit] = useState(false);
	const [currentUserId, setCurrentUserId] = useState(null);

	useEffect(() => {
		const fetchUsers = async () => {
			setLoading(true);
			setError("");
			try {
				const data = await getUsers();
				setUsers(Array.isArray(data) ? data : []);
			} catch (_e) {
				setError("No se pudieron cargar los usuarios");
			} finally {
				setLoading(false);
			}
		};
		fetchUsers();
		try {
			const token = localStorage.getItem("token");
			if (token) {
				const payload = JSON.parse(atob(token.split(".")[1]));
				if (payload?.id) setCurrentUserId(payload.id);
			}
		} catch (_e) {
			// noop
		}
	}, []);

	const filtered = useMemo(() => {
		const q = filter.trim().toLowerCase();
		let list = users;
		if (statusFilter === "active") list = list.filter((u) => u.is_active);
		else if (statusFilter === "inactive")
			list = list.filter((u) => !u.is_active);
		if (!q) return list;
		return list.filter(
			(u) =>
				`${u.username}`.toLowerCase().includes(q) ||
				`${u.role_name}`.toLowerCase().includes(q)
		);
	}, [users, filter, statusFilter]);

	const totalUsers = users.length;
	const activeUsers = users.filter((u) => u.is_active).length;
	const inactiveUsers = Math.max(0, totalUsers - activeUsers);

	const RoleDropdown = ({ value, onChange, disabled = false }) => {
		const [open, setOpen] = useState(false);
		const current = ROLES.includes(value) ? value : ROLES[0];
		return (
			<div className="relative">
				<button
					type="button"
					onClick={() => !disabled && setOpen((v) => !v)}
					className={`px-3 py-2 border rounded-lg inline-flex items-center gap-2 ${
						disabled
							? "text-gray-400 cursor-not-allowed bg-gray-50"
							: "text-gray-900"
					}`}
				>
					<span className="capitalize">{current}</span>
					<FiChevronDown className="text-gray-500" />
				</button>
				{open && !disabled && (
					<div className="absolute z-10 mt-1 w-40 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
						{ROLES.map((r) => (
							<button
								key={r}
								type="button"
								onClick={() => {
									onChange(r);
									setOpen(false);
								}}
								className={`w-full text-left px-3 py-2 text-sm capitalize hover:bg-gray-50 flex items-center justify-between ${
									r === current ? "bg-green-50 text-green-800" : "text-gray-800"
								}`}
							>
								{r}
								{r === current && <FiCheck />}
							</button>
						))}
					</div>
				)}
			</div>
		);
	};

	const ToggleSwitch = ({ checked, onChange }) => (
		<button
			type="button"
			onClick={onChange}
			className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
				checked ? "bg-green-600" : "bg-gray-300"
			}`}
		>
			<span
				className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
					checked ? "translate-x-6" : "translate-x-0"
				}`}
			/>
		</button>
	);

	const handleChangeRole = async (userId, role) => {
		try {
			await updateUserRole(userId, role);
			setUsers((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, role_name: role } : u))
			);
		} catch (_e) {
			alert("No se pudo actualizar el rol");
		}
	};

	const handleToggleActive = async (userId, current) => {
		try {
			await updateUserStatusApi(userId, !current);
			setUsers((prev) =>
				prev.map((u) => (u.id === userId ? { ...u, is_active: !current } : u))
			);
		} catch {
			alert("No se pudo actualizar el estado");
		}
	};

	const handleDelete = async (userId) => {
		try {
			await deleteUserApi(userId);
			setUsers((prev) => prev.filter((u) => u.id !== userId));
		} catch {
			alert("No se pudo eliminar el usuario");
		}
	};

	const openEdit = (user) => {
		setEditUser(user);
		setEditRole(user.role_name);
		setEditActive(!!user.is_active);
	};

	const saveEdit = async () => {
		if (!editUser) return;
		setSavingEdit(true);
		try {
			if (editRole && editRole !== editUser.role_name) {
				await updateUserRole(editUser.id, editRole);
			}
			if (
				typeof editActive === "boolean" &&
				editActive !== editUser.is_active
			) {
				await updateUserStatusApi(editUser.id, editActive);
			}
			setUsers((prev) =>
				prev.map((u) =>
					u.id === editUser.id
						? { ...u, role_name: editRole, is_active: editActive }
						: u
				)
			);
			setEditUser(null);
		} catch {
			alert("No se pudieron guardar los cambios");
		} finally {
			setSavingEdit(false);
		}
	};

	const handleCreateUser = async (e) => {
		e.preventDefault();
		if (!newUser.username || !newUser.password) return;
		setCreating(true);
		try {
			await createUser(newUser);
			setNewUser({ username: "", password: "", role: "ventas" });
			const data = await getUsers();
			setUsers(Array.isArray(data) ? data : []);
			setIsModalOpen(false);
		} catch (_e) {
			alert("No se pudo crear el usuario");
		} finally {
			setCreating(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
				<h2 className="text-2xl md:text-3xl font-bold text-gray-900">
					Gestión de Usuarios
				</h2>
				<p className="text-gray-600 mt-1">
					Administra los usuarios que tienen control
				</p>
				<div className="mt-4">
					<button
						onClick={() => setIsModalOpen(true)}
						type="button"
						className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800"
					>
						<FiUserPlus />
						Nuevo usuario
					</button>
				</div>
				{error && <p className="text-red-600 text-sm mt-3">{error}</p>}
			</div>

			{/* Search + counters */}
			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
				<div className="flex flex-col md:flex-row md:items-center gap-3">
					<div className="relative flex-1">
						<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
							placeholder="Buscar por usuario o rol..."
							className="w-full pl-9 pr-3 py-2 border rounded-lg text-gray-900"
						/>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setStatusFilter("all")}
							className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
								statusFilter === "all"
									? "bg-gray-900 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							Total: {totalUsers}
						</button>
						<button
							onClick={() => setStatusFilter("active")}
							className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
								statusFilter === "active"
									? "bg-green-600 text-white"
									: "bg-green-50 text-green-700 hover:bg-green-100"
							}`}
						>
							Activos: {activeUsers}
						</button>
						<button
							onClick={() => setStatusFilter("inactive")}
							className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
								statusFilter === "inactive"
									? "bg-gray-700 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							Inactivos: {inactiveUsers}
						</button>
					</div>
				</div>
			</div>

			{/* Modal Crear Usuario */}
			{isModalOpen && (
				<div className="fixed inset-0 z-[2000] flex items-center justify-center">
					<div
						className="absolute inset-0 bg-black/50"
						onClick={() => !creating && setIsModalOpen(false)}
					/>
					<div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl border border-green-100">
						<div className="flex items-center justify-between px-5 py-3 border-b">
							<h3 className="text-lg font-semibold text-gray-900">
								Nuevo usuario
							</h3>
							<button
								onClick={() => !creating && setIsModalOpen(false)}
								className="p-2 text-gray-500 hover:text-gray-700"
								aria-label="Cerrar"
							>
								<FiX />
							</button>
						</div>
						<form onSubmit={handleCreateUser} className="px-5 py-4 space-y-3">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Usuario
								</label>
								<div className="relative">
									<FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
									<input
										type="text"
										value={newUser.username}
										onChange={(e) =>
											setNewUser((s) => ({ ...s, username: e.target.value }))
										}
										className="w-full pl-9 pr-3 py-2 border rounded-lg text-gray-900"
										placeholder="jdoe"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Contraseña
								</label>
								<div className="relative">
									<FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
									<input
										type="password"
										value={newUser.password}
										onChange={(e) =>
											setNewUser((s) => ({ ...s, password: e.target.value }))
										}
										className="w-full pl-9 pr-3 py-2 border rounded-lg text-gray-900"
										placeholder="••••••••"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Rol
								</label>
								<RoleDropdown
									value={newUser.role}
									onChange={(val) => setNewUser((s) => ({ ...s, role: val }))}
								/>
							</div>
							<div className="pt-2 flex gap-2 justify-end">
								<button
									type="button"
									onClick={() => !creating && setIsModalOpen(false)}
									className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={creating}
									className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:bg-gray-400"
								>
									<FiUserPlus />
									{creating ? "Creando..." : "Crear usuario"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal Confirmación Eliminar */}
			<AnimatePresence>
				{confirmId && (
					<Motion.div className="fixed inset-0 z-[2000] flex items-center justify-center">
						<Motion.div
							className="absolute inset-0 bg-black/50"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setConfirmId(null)}
						/>
						<Motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ type: "spring", stiffness: 260, damping: 20 }}
							className="relative bg-white w-full max-w-sm mx-4 rounded-2xl shadow-2xl border border-gray-100 p-5"
						>
							<h4 className="text-lg font-semibold text-gray-900">
								Eliminar usuario
							</h4>
							<p className="text-sm text-gray-600 mt-1">
								Esta acción no se puede deshacer.
							</p>
							<div className="mt-4 flex justify-end gap-2">
								<button
									onClick={() => setConfirmId(null)}
									className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
								>
									Cancelar
								</button>
								<button
									onClick={async () => {
										await handleDelete(confirmId);
										setConfirmId(null);
									}}
									className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
								>
									Eliminar
								</button>
							</div>
						</Motion.div>
					</Motion.div>
				)}
			</AnimatePresence>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{loading ? (
					<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
						Cargando...
					</div>
				) : (
					filtered.map((u) => (
						<div
							key={u.id}
							className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center ${
											u.is_active
												? "bg-green-50 text-green-700"
												: "bg-gray-100 text-gray-600"
										}`}
									>
										<FiShield />
									</div>
									<div>
										<div className="font-semibold text-gray-900">
											{u.username}
										</div>
										<div className="text-xs text-gray-500">
											ID: {u.id.slice(0, 8)}…
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-2">
										{u.id === currentUserId ? (
											<span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
												Tu usuario
											</span>
										) : (
											<>
												<ToggleSwitch
													checked={u.is_active}
													onChange={() => handleToggleActive(u.id, u.is_active)}
												/>
												<span
													className={`text-xs ${
														u.is_active ? "text-green-700" : "text-gray-600"
													}`}
												>
													{u.is_active ? "Activo" : "Inactivo"}
												</span>
											</>
										)}
									</div>
									<button
										onClick={() => setConfirmId(u.id)}
										className={`px-2 py-1 text-xs rounded-full ${
											u.id === currentUserId
												? "bg-gray-100 text-gray-400 cursor-not-allowed"
												: "bg-red-50 text-red-700 hover:bg-red-100"
										}`}
										disabled={u.id === currentUserId}
									>
										<FiTrash2 />
									</button>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<RoleDropdown
									value={u.role_name}
									onChange={(val) => handleChangeRole(u.id, val)}
									disabled={u.id === currentUserId}
								/>
								<button
									onClick={() => openEdit(u)}
									className="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
									disabled={u.id === currentUserId}
								>
									<FiEdit2 />
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{/* Modal Editar Usuario */}
			<AnimatePresence>
				{editUser && (
					<Motion.div className="fixed inset-0 z-[2000] flex items-center justify-center">
						<Motion.div
							className="absolute inset-0 bg-black/50"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => !savingEdit && setEditUser(null)}
						/>
						<Motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ type: "spring", stiffness: 260, damping: 20 }}
							className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl border border-gray-100"
						>
							<div className="flex items-center justify-between px-5 py-3 border-b">
								<h3 className="text-lg font-semibold text-gray-900">
									Editar usuario
								</h3>
								<button
									onClick={() => !savingEdit && setEditUser(null)}
									className="p-2 text-gray-500 hover:text-gray-700"
									aria-label="Cerrar"
								>
									<FiX />
								</button>
							</div>
							<div className="px-5 py-4 space-y-4">
								<div>
									<div className="text-sm text-gray-600">Usuario</div>
									<div className="font-semibold text-gray-900">
										{editUser.username}
									</div>
								</div>
								<div className="flex items-center justify-between gap-3">
									<div className="flex-1">
										<div className="text-sm text-gray-700 mb-1">Rol</div>
										<RoleDropdown value={editRole} onChange={setEditRole} />
									</div>
									<div className="flex items-center gap-3">
										<div className="text-sm text-gray-700">Estado</div>
										<ToggleSwitch
											checked={editActive}
											onChange={() => setEditActive((v) => !v)}
										/>
										<span
											className={`text-xs ${
												editActive ? "text-green-700" : "text-gray-600"
											}`}
										>
											{editActive ? "Activo" : "Inactivo"}
										</span>
									</div>
								</div>
								<div className="pt-2 flex gap-2 justify-end">
									<button
										onClick={() => !savingEdit && setEditUser(null)}
										className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
									>
										Cancelar
									</button>
									<button
										onClick={saveEdit}
										disabled={savingEdit}
										className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:bg-gray-400"
									>
										{savingEdit ? "Guardando..." : "Guardar cambios"}
									</button>
								</div>
							</div>
						</Motion.div>
					</Motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default UsersAdmin;
