import { FormData, FormErrors } from "../types";

/**
 * Validate partner application form data
 */
export const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};

  // Required fields validation
  if (!formData.gymName.trim()) {
    errors.gymName = "กรุณากรอกชื่อยิม";
  }

  if (!formData.contactName.trim()) {
    errors.contactName = "กรุณากรอกชื่อผู้ติดต่อ";
  }

  if (!formData.phone.trim()) {
    errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
  } else if (!/^[0-9]{9,10}$/.test(formData.phone.replace(/-/g, ""))) {
    errors.phone = "เบอร์โทรศัพท์ไม่ถูกต้อง (9-10 หลัก)";
  }

  if (!formData.email.trim()) {
    errors.email = "กรุณากรอกอีเมล";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  }

  if (!formData.address.trim()) {
    errors.address = "กรุณากรอกที่อยู่";
  }

  if (!formData.termsAccepted) {
    errors.termsAccepted = "กรุณายืนยันความถูกต้องและรับทราบเงื่อนไข";
  }

  return errors;
};

