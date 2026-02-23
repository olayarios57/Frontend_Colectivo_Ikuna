const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'ikuna2024',
};

const ADMIN_USER = {
  username: 'admin',
  role: 'superadmin',
  name: 'Administrador Principal',
  email: 'admin@ikuna.com',
};

export function login(username, password) {
  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    return { success: true, user: ADMIN_USER };
  }
  return { success: false, user: null };
}

export function registerRequest(userData) {
  // Simula el registro pendiente de aprobación
  // En una implementación real, esto haría una llamada al backend
  return {
    success: true,
    message:
      '¡Registro exitoso! Tu solicitud está pendiente de aprobación por el administrador principal.',
  };
}

export function sendPasswordRecovery(email) {
  // Simula el envío de email de recuperación
  // En una implementación real, esto haría una llamada al backend
  return {
    success: true,
    message: 'Se ha enviado un enlace de recuperación a tu correo electrónico.',
  };
}

export function approveUser(userId, usersList) {
  return usersList.filter((u) => u.id !== userId);
}

export function rejectUser(userId, usersList) {
  return usersList.filter((u) => u.id !== userId);
}