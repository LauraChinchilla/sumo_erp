import { useState } from 'react';

export default function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);

  // Reinicia el formulario a los valores iniciales
  const resetForm = () => {
    setValues(initialValues);
  };

  // Opcional: función para actualizar un solo campo (más cómoda)
  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  return {
    values,
    setValues,
    resetForm,
    handleChange,
  };
}
