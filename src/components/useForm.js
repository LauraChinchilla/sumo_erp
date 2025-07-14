import { useState } from 'react';

export default function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Reinicia valores y errores
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  // Actualiza un solo campo
  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Asigna un error específico
  const setFieldError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  // Asigna todos los errores de golpe
  const setAllErrors = (errorObj) => {
    setErrors(errorObj);
  };

  // Valida campos según reglas
  const validateForm = (rules) => {
    const newErrors = {};

    for (const field in rules) {
      const value = values[field];
      const rule = rules[field];

      if (rule.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = rule.message || 'Este campo es obligatorio';
      }

      if (rule.minLength && value?.length < rule.minLength) {
        newErrors[field] = rule.message || `Debe tener al menos ${rule.minLength} caracteres`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        newErrors[field] = rule.message || 'Formato inválido';
      }

      if (rule.custom && typeof rule.custom === 'function') {
        const customError = rule.custom(value, values);
        if (customError) {
          newErrors[field] = customError;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    values,
    setValues,
    resetForm,
    handleChange,
    errors,
    setFieldError,
    setAllErrors,
    validateForm,
  };
}
