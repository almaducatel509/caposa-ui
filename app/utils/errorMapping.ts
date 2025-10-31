// /lib/utils/errorMapping.ts
export function mapApiErrorsToFieldErrors(error: any): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  const data = error?.response?.data;
  if (!data) {
    fieldErrors.form = "Une erreur inconnue est survenue.";
    return fieldErrors;
  }

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      fieldErrors[key === "non_field_errors" ? "form" : key] = value.join(", ");
    } else if (typeof value === "string") {
      fieldErrors[key] = value;
    }
  });

  return fieldErrors;
}
