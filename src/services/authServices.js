// src/services/authServices.js
import { apiService } from './apiService';

/**
 * Realiza el login consultando al backend en Render
 */
export async function login(username, password) {
  try {
    const userData = await apiService.login({ username, password });
    
    // aquí, el backend validó las credenciales en la base de datos
    // Retornamos éxito y el objeto del usuario (ej. el de sara_olaya)
    return { 
      success: true, 
      user: userData 
    };
  } catch (error) {
    console.error("Error en la autenticación:", error);
    return { 
      success: false, 
      user: null, 
      message: error.response?.data?.message || 'Usuario o contraseña incorrectos' 
    };
  }
}

/**
 * Registra una nueva solicitud de usuario en la base de datos
 */
export async function registerRequest(userData) {
  try {
    await apiService.register(userData);
    return {
      success: true,
      message: '¡Registro exitoso! Tu solicitud está pendiente de aprobación por el administrador.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'No se pudo procesar el registro. Inténtalo de nuevo más tarde.',
    };
  }
}

/**
 * Simulación de recuperación (este suele ser un endpoint aparte)
 */
export async function sendPasswordRecovery(email) {
  return {
    success: true,
    message: 'Se ha enviado un enlace de recuperación a tu correo electrónico.',
  };
}

// Filtros locales para la UI del administrador
export function approveUser(userId, usersList) {
  return usersList.filter((u) => u.id !== userId);
}

export function rejectUser(userId, usersList) {
  return usersList.filter((u) => u.id !== userId);
}