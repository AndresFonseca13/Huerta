import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
	getUsers,
	updateUserRole,
	createUser,
	updateUserStatus as updateUserStatusApi,
	deleteUser as deleteUserApi,
	resetUserPassword,
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
	FiCheckCircle,
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
	const [currentUserRole, setCurrentUserRole] = useState(null);
	const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
	const [newPassword, setNewPassword] = useState("");
	const [resettingPassword, setResettingPassword] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

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
				if (payload?.role) setCurrentUserRole(payload.role);
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
		const [openUp, setOpenUp] = useState(false);
		const [menuMaxH, setMenuMaxH] = useState(200);
		const btnRef = React.useRef(null);
		const current = ROLES.includes(value) ? value : ROLES[0];

		React.useEffect(() => {
			if (!open) return;
			const compute = () => {
				if (!btnRef.current) return;
				const rect = btnRef.current.getBoundingClientRect();
				const gap = 8;
				const spaceBelow = window.innerHeight - rect.bottom - gap;
				const spaceAbove = rect.top - gap;
				const desired = 200;
				const shouldOpenUp = spaceBelow < desired && spaceAbove > spaceBelow;
				setOpenUp(shouldOpenUp);
				setMenuMaxH(
					Math.max(140, (shouldOpenUp ? spaceAbove : spaceBelow) - 8)
				);
			};
			compute();
			window.addEventListener("resize", compute);
			window.addEventListener("scroll", compute, true);
			return () => {
				window.removeEventListener("resize", compute);
				window.removeEventListener("scroll", compute, true);
			};
		}, [open]);

		return (
			<div className="relative">
				<button
					ref={btnRef}
					type="button"
					onClick={() => !disabled && setOpen((v) => !v)}
					className={`px-3 py-2 rounded-lg inline-flex items-center gap-2 ${
						disabled ? "cursor-not-allowed opacity-60" : ""
					}`}
					style={{
						backgroundColor: "#2a2a2a",
						color: "#e9cc9e",
						border: "1px solid #3a3a3a",
					}}
				>
					<span className="capitalize">{current}</span>
					<FiChevronDown style={{ color: "#b8b8b8" }} />
				</button>
				{open && !disabled && (
					<div
						className="absolute z-10 w-40 rounded-xl shadow-lg overflow-auto"
						style={{
							backgroundColor: "#2a2a2a",
							border: "1px solid #3a3a3a",
							maxHeight: menuMaxH,
							top: openUp ? "auto" : "100%",
							bottom: openUp ? "100%" : "auto",
							marginTop: openUp ? undefined : 4,
							marginBottom: openUp ? 4 : undefined,
						}}
					>
						{ROLES.map((r) => (
							<button
								key={r}
								type="button"
								onClick={() => {
									onChange(r);
									setOpen(false);
								}}
								className="w-full text-left px-3 py-2 text-sm capitalize flex items-center justify-between"
								style={
									r === current
										? { backgroundColor: "#e9cc9e", color: "#191919" }
										: { color: "#e9cc9e" }
								}
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
			className="relative w-12 h-6 rounded-full transition-colors duration-300"
			style={{
				backgroundColor: checked ? "#e9cc9e" : "#3a3a3a",
				border: "1px solid #3a3a3a",
			}}
		>
			<span
				className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform duration-300 ${
					checked ? "translate-x-6" : "translate-x-0"
				}`}
				style={{ backgroundColor: "#191919" }}
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

	const handleResetPassword = async () => {
		if (!resetPasswordUserId || !newPassword || newPassword.length < 6) {
			alert("La contraseña debe tener al menos 6 caracteres");
			return;
		}
		setResettingPassword(true);
		try {
			await resetUserPassword(resetPasswordUserId, newPassword);
			const username = users.find(u => u.id === resetPasswordUserId)?.username || "";
			setSuccessMessage(`Contraseña restablecida exitosamente para el usuario ${username}`);
			setResetPasswordUserId(null);
			setNewPassword("");
			setShowSuccessModal(true);
			// Cerrar automáticamente después de 3 segundos
			setTimeout(() => {
				setShowSuccessModal(false);
			}, 3000);
		} catch (error) {
			const message = error.response?.data?.mensaje || "No se pudo restablecer la contraseña";
			alert(message);
		} finally {
			setResettingPassword(false);
		}
	};

	return (
		<div className="space-y-6" style={{ backgroundColor: "#191919" }}>
			{/* Header */}
			<div
				className="rounded-2xl border shadow-sm p-6"
				style={{ backgroundColor: "#2a2a2a", borderColor: "#3a3a3a" }}
			>
				<h2
					className="text-2xl md:text-3xl font-bold"
					style={{ color: "#e9cc9e" }}
				>
					Gestión de Usuarios
				</h2>
				<p className="mt-1" style={{ color: "#b8b8b8" }}>
					Administra los usuarios que tienen control
				</p>
				<div className="mt-4">
					<button
						onClick={() => setIsModalOpen(true)}
						type="button"
						className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
						style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
					>
						<FiUserPlus />
						Nuevo usuario
					</button>
				</div>
				{error && <p className="text-red-600 text-sm mt-3">{error}</p>}
			</div>

			{/* Search + counters */}
			<div
				className="rounded-2xl border shadow-sm p-4"
				style={{ backgroundColor: "#2a2a2a", borderColor: "#3a3a3a" }}
			>
				<div className="flex flex-col md:flex-row md:items-center gap-3">
					<div className="relative flex-1">
						<FiSearch
							className="absolute left-3 top-1/2 -translate-y-1/2"
							style={{ color: "#b8b8b8" }}
						/>
						<input
							type="text"
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
							placeholder="Buscar por usuario o rol..."
							className="w-full pl-9 pr-3 py-2 border rounded-lg placeholder-[#b8b8b8] caret-[#e9cc9e]"
							style={{
								backgroundColor: "#2a2a2a",
								color: "#e9cc9e",
								border: "1px solid #3a3a3a",
							}}
						/>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setStatusFilter("all")}
							className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
								statusFilter === "all" ? "font-semibold" : ""
							}`}
							style={
								statusFilter === "all"
									? { backgroundColor: "#e9cc9e", color: "#191919" }
									: {
											backgroundColor: "#2a2a2a",
											color: "#e9cc9e",
											border: "1px solid #3a3a3a",
									  }
							}
						>
							Total: {totalUsers}
						</button>
						<button
							onClick={() => setStatusFilter("active")}
							className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
								statusFilter === "active" ? "font-semibold" : ""
							}`}
							style={
								statusFilter === "active"
									? { backgroundColor: "#e9cc9e", color: "#191919" }
									: {
											backgroundColor: "#2a2a2a",
											color: "#e9cc9e",
											border: "1px solid #3a3a3a",
									  }
							}
						>
							Activos: {activeUsers}
						</button>
						<button
							onClick={() => setStatusFilter("inactive")}
							className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
								statusFilter === "inactive" ? "font-semibold" : ""
							}`}
							style={
								statusFilter === "inactive"
									? { backgroundColor: "#e9cc9e", color: "#191919" }
									: {
											backgroundColor: "#2a2a2a",
											color: "#e9cc9e",
											border: "1px solid #3a3a3a",
									  }
							}
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
					<div
						className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl"
						style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
					>
						<div className="flex items-center justify-between px-5 py-3 border-b">
							<h3
								className="text-lg font-semibold"
								style={{ color: "#e9cc9e" }}
							>
								Nuevo usuario
							</h3>
							<button
								onClick={() => !creating && setIsModalOpen(false)}
								className="p-2"
								style={{ color: "#b8b8b8" }}
								aria-label="Cerrar"
							>
								<FiX />
							</button>
						</div>
						<form onSubmit={handleCreateUser} className="px-5 py-4 space-y-3">
							<div>
								<label
									className="block text-sm font-medium mb-1"
									style={{ color: "#e9cc9e" }}
								>
									Usuario
								</label>
								<div className="relative">
									<FiUser
										className="absolute left-3 top-1/2 -translate-y-1/2"
										style={{ color: "#b8b8b8" }}
									/>
									<input
										type="text"
										value={newUser.username}
										onChange={(e) =>
											setNewUser((s) => ({ ...s, username: e.target.value }))
										}
										className="w-full pl-9 pr-3 py-2 border rounded-lg placeholder-[#b8b8b8] caret-[#e9cc9e]"
										style={{
											backgroundColor: "#2a2a2a",
											color: "#e9cc9e",
											border: "1px solid #3a3a3a",
										}}
										placeholder="jdoe"
									/>
								</div>
							</div>
							<div>
								<label
									className="block text-sm font-medium mb-1"
									style={{ color: "#e9cc9e" }}
								>
									Contraseña
								</label>
								<div className="relative">
									<FiLock
										className="absolute left-3 top-1/2 -translate-y-1/2"
										style={{ color: "#b8b8b8" }}
									/>
									<input
										type="password"
										value={newUser.password}
										onChange={(e) =>
											setNewUser((s) => ({ ...s, password: e.target.value }))
										}
										className="w-full pl-9 pr-3 py-2 border rounded-lg placeholder-[#b8b8b8] caret-[#e9cc9e]"
										style={{
											backgroundColor: "#2a2a2a",
											color: "#e9cc9e",
											border: "1px solid #3a3a3a",
										}}
										placeholder="••••••••"
									/>
								</div>
							</div>
							<div>
								<label
									className="block text-sm font-medium mb-1"
									style={{ color: "#e9cc9e" }}
								>
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
									className="px-4 py-2 rounded-lg"
									style={{ border: "1px solid #3a3a3a", color: "#e9cc9e" }}
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={creating}
									className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
									style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
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
							className="relative w-full max-w-sm mx-4 rounded-2xl shadow-2xl p-5"
							style={{
								backgroundColor: "#2a2a2a",
								border: "1px solid #3a3a3a",
							}}
						>
							<h4
								className="text-lg font-semibold"
								style={{ color: "#e9cc9e" }}
							>
								Eliminar usuario
							</h4>
							<p className="text-sm mt-1" style={{ color: "#b8b8b8" }}>
								Esta acción no se puede deshacer.
							</p>
							<div className="mt-4 flex justify-end gap-2">
								<button
									onClick={() => setConfirmId(null)}
									className="px-4 py-2 rounded-lg"
									style={{
										backgroundColor: "#2a2a2a",
										color: "#e9cc9e",
										border: "1px solid #3a3a3a",
									}}
								>
									Cancelar
								</button>
								<button
									onClick={async () => {
										await handleDelete(confirmId);
										setConfirmId(null);
									}}
									className="px-4 py-2 rounded-lg"
									style={{
										backgroundColor: "#b91c1c",
										color: "#ffffff",
										border: "1px solid #7f1d1d",
									}}
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
					<div
						className="rounded-2xl border shadow-sm p-4"
						style={{
							backgroundColor: "#2a2a2a",
							borderColor: "#3a3a3a",
							color: "#b8b8b8",
						}}
					>
						Cargando...
					</div>
				) : (
					filtered.map((u) => (
						<div
							key={u.id}
							className="rounded-2xl border shadow-sm p-4 flex flex-col gap-3"
							style={{ backgroundColor: "#2a2a2a", borderColor: "#3a3a3a" }}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center`}
										style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
									>
										<FiShield />
									</div>
									<div>
										<div className="font-semibold" style={{ color: "#e9cc9e" }}>
											{u.username}
										</div>
										<div className="text-xs" style={{ color: "#9a9a9a" }}>
											ID: {u.id.slice(0, 8)}…
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-2">
										{u.id === currentUserId ? (
											<span
												className="text-[11px] px-2 py-1 rounded-full"
												style={{ backgroundColor: "#3a3a3a", color: "#e9cc9e" }}
											>
												Tu usuario
											</span>
										) : (
											<>
												<ToggleSwitch
													checked={u.is_active}
													onChange={() => handleToggleActive(u.id, u.is_active)}
												/>
												<span className="text-xs" style={{ color: "#b8b8b8" }}>
													{u.is_active ? "Activo" : "Inactivo"}
												</span>
											</>
										)}
									</div>
									<button
										onClick={() => setConfirmId(u.id)}
										className={`px-2 py-1 text-xs rounded-full ${
											u.id === currentUserId ? "" : ""
										}`}
										style={
											u.id === currentUserId
												? {
														backgroundColor: "#2a2a2a",
														color: "#b8b8b8",
														border: "1px solid #3a3a3a",
														cursor: "not-allowed",
												  }
												: {
														backgroundColor: "#2a2a2a",
														color: "#e9cc9e",
														border: "1px solid #3a3a3a",
												  }
										}
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
									className="px-3 py-2 rounded-lg"
									style={{ border: "1px solid #3a3a3a", color: "#e9cc9e" }}
									disabled={u.id === currentUserId}
								>
									<FiEdit2 />
								</button>
								{currentUserRole === "admin" && (
									<button
										onClick={() => setResetPasswordUserId(u.id)}
										className="px-3 py-2 rounded-lg"
										style={{ border: "1px solid #3a3a3a", color: "#e9cc9e" }}
										title="Restablecer contraseña"
									>
										<FiLock />
									</button>
								)}
							</div>
						</div>
					))
				)}
			</div>

			{/* Modal Restablecer Contraseña */}
			<AnimatePresence>
				{resetPasswordUserId && (
					<Motion.div className="fixed inset-0 z-[2000] flex items-center justify-center">
						<Motion.div
							className="absolute inset-0 bg-black/50"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => !resettingPassword && setResetPasswordUserId(null)}
						/>
						<Motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ type: "spring", stiffness: 260, damping: 20 }}
							className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl"
							style={{
								backgroundColor: "#2a2a2a",
								border: "1px solid #3a3a3a",
							}}
						>
							<div
								className="flex items-center justify-between px-5 py-3 border-b"
								style={{ borderColor: "#3a3a3a" }}
							>
								<h3
									className="text-lg font-semibold"
									style={{ color: "#e9cc9e" }}
								>
									Restablecer contraseña
								</h3>
								<button
									onClick={() => !resettingPassword && setResetPasswordUserId(null)}
									className="p-2"
									style={{ color: "#b8b8b8" }}
									aria-label="Cerrar"
								>
									<FiX />
								</button>
							</div>
							<div className="px-5 py-4 space-y-4">
								<div>
									<div className="text-sm mb-2" style={{ color: "#b8b8b8" }}>
										Usuario: <span style={{ color: "#e9cc9e" }}>{users.find(u => u.id === resetPasswordUserId)?.username}</span>
									</div>
									<label
										className="block text-sm font-medium mb-1"
										style={{ color: "#e9cc9e" }}
									>
										Nueva contraseña
									</label>
									<div className="relative">
										<FiLock
											className="absolute left-3 top-1/2 -translate-y-1/2"
											style={{ color: "#b8b8b8" }}
										/>
										<input
											type="password"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											className="w-full pl-9 pr-3 py-2 border rounded-lg placeholder-[#b8b8b8] caret-[#e9cc9e]"
											style={{
												backgroundColor: "#2a2a2a",
												color: "#e9cc9e",
												border: "1px solid #3a3a3a",
											}}
											placeholder="••••••••"
											minLength={6}
										/>
									</div>
									<p className="text-xs mt-1" style={{ color: "#9a9a9a" }}>
										La contraseña debe tener al menos 6 caracteres
									</p>
								</div>
								<div className="pt-2 flex gap-2 justify-end">
									<button
										onClick={() => {
											if (!resettingPassword) {
												setResetPasswordUserId(null);
												setNewPassword("");
											}
										}}
										className="px-4 py-2 rounded-lg"
										style={{
											backgroundColor: "#2a2a2a",
											color: "#e9cc9e",
											border: "1px solid #3a3a3a",
										}}
										disabled={resettingPassword}
									>
										Cancelar
									</button>
									<button
										onClick={handleResetPassword}
										disabled={resettingPassword || !newPassword || newPassword.length < 6}
										className="inline-flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50"
										style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
									>
										<FiLock />
										{resettingPassword ? "Restableciendo..." : "Restablecer contraseña"}
									</button>
								</div>
							</div>
						</Motion.div>
					</Motion.div>
				)}
			</AnimatePresence>

			{/* Modal de Éxito */}
			<AnimatePresence>
				{showSuccessModal && (
					<Motion.div className="fixed inset-0 z-[2100] flex items-center justify-center">
						<Motion.div
							className="absolute inset-0 bg-black/50"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setShowSuccessModal(false)}
						/>
						<Motion.div
							initial={{ opacity: 0, scale: 0.8, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.8, y: 20 }}
							transition={{ 
								type: "spring", 
								stiffness: 300, 
								damping: 25 
							}}
							className="relative w-full max-w-sm mx-4 rounded-2xl shadow-2xl p-6"
							style={{
								backgroundColor: "#2a2a2a",
								border: "1px solid #3a3a3a",
							}}
						>
							<div className="flex flex-col items-center text-center space-y-4">
								<Motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ 
										type: "spring", 
										stiffness: 200, 
										damping: 15,
										delay: 0.1 
									}}
									className="w-16 h-16 rounded-full flex items-center justify-center"
									style={{ backgroundColor: "#22c55e" }}
								>
									<FiCheckCircle 
										size={32} 
										style={{ color: "#ffffff" }} 
									/>
								</Motion.div>
								<Motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
								>
									<h3
										className="text-xl font-semibold mb-2"
										style={{ color: "#e9cc9e" }}
									>
										¡Éxito!
									</h3>
									<p className="text-sm" style={{ color: "#b8b8b8" }}>
										{successMessage}
									</p>
								</Motion.div>
								<Motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.3 }}
									className="w-full"
								>
									<button
										onClick={() => setShowSuccessModal(false)}
										className="w-full px-4 py-2 rounded-lg font-medium"
										style={{ 
											backgroundColor: "#e9cc9e", 
											color: "#191919" 
										}}
									>
										Aceptar
									</button>
								</Motion.div>
							</div>
						</Motion.div>
					</Motion.div>
				)}
			</AnimatePresence>

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
							className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl"
							style={{
								backgroundColor: "#2a2a2a",
								border: "1px solid #3a3a3a",
							}}
						>
							<div
								className="flex items-center justify-between px-5 py-3 border-b"
								style={{ borderColor: "#3a3a3a" }}
							>
								<h3
									className="text-lg font-semibold"
									style={{ color: "#e9cc9e" }}
								>
									Editar usuario
								</h3>
								<button
									onClick={() => !savingEdit && setEditUser(null)}
									className="p-2"
									style={{ color: "#b8b8b8" }}
									aria-label="Cerrar"
								>
									<FiX />
								</button>
							</div>
							<div className="px-5 py-4 space-y-4">
								<div>
									<div className="text-sm" style={{ color: "#b8b8b8" }}>
										Usuario
									</div>
									<div className="font-semibold" style={{ color: "#e9cc9e" }}>
										{editUser.username}
									</div>
								</div>
								<div className="flex items-center justify-between gap-3">
									<div className="flex-1">
										<div className="text-sm mb-1" style={{ color: "#e9cc9e" }}>
											Rol
										</div>
										<RoleDropdown value={editRole} onChange={setEditRole} />
									</div>
									<div className="flex items-center gap-3">
										<div className="text-sm" style={{ color: "#e9cc9e" }}>
											Estado
										</div>
										<ToggleSwitch
											checked={editActive}
											onChange={() => setEditActive((v) => !v)}
										/>
										<span
											className="text-xs"
											style={{ color: editActive ? "#22c55e" : "#b8b8b8" }}
										>
											{editActive ? "Activo" : "Inactivo"}
										</span>
									</div>
								</div>
								<div className="pt-2 flex gap-2 justify-end">
									<button
										onClick={() => !savingEdit && setEditUser(null)}
										className="px-4 py-2 rounded-lg"
										style={{
											backgroundColor: "#2a2a2a",
											color: "#e9cc9e",
											border: "1px solid #3a3a3a",
										}}
									>
										Cancelar
									</button>
									<button
										onClick={saveEdit}
										disabled={savingEdit}
										className="inline-flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50"
										style={{ backgroundColor: "#e9cc9e", color: "#191919" }}
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
