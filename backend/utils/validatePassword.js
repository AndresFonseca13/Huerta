const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, message: 'La contraseña debe tener al menos 8 caracteres' },
  { test: (p) => /[a-z]/.test(p), message: 'Debe contener al menos una letra minúscula' },
  { test: (p) => /[A-Z]/.test(p), message: 'Debe contener al menos una letra mayúscula' },
  { test: (p) => /[0-9]/.test(p), message: 'Debe contener al menos un número' },
  { test: (p) => /[!@#$%&*]/.test(p), message: 'Debe contener al menos un carácter especial (!@#$%&*)' },
];

export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'La contraseña es requerida';
  }

  const errors = PASSWORD_RULES
    .filter((rule) => !rule.test(password))
    .map((rule) => rule.message);

  return errors.length > 0 ? errors.join('. ') : null;
}
