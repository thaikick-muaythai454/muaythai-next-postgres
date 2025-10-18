import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
} from '@heroui/react';
import type { Gym } from '@/types/database.types';

interface GymEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  gym: Gym | null;
  onSave: (gymId: string, data: Partial<Gym>) => Promise<void>;
  isProcessing: boolean;
}

interface FormData {
  gym_name: string;
  contact_name: string;
  phone: string;
  email: string;
  website: string;
  location: string;
  gym_details: string;
  services: string[];
  status: 'pending' | 'approved' | 'rejected';
}

interface FormErrors {
  gym_name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  location?: string;
}

export default function GymEditModal({
  isOpen,
  onClose,
  gym,
  onSave,
  isProcessing,
}: GymEditModalProps) {
  const [formData, setFormData] = useState<FormData>({
    gym_name: '',
    contact_name: '',
    phone: '',
    email: '',
    website: '',
    location: '',
    gym_details: '',
    services: [],
    status: 'pending',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serviceInput, setServiceInput] = useState('');

  // Pre-fill form data when gym changes
  useEffect(() => {
    if (gym) {
      setFormData({
        gym_name: gym.gym_name || '',
        contact_name: gym.contact_name || '',
        phone: gym.phone || '',
        email: gym.email || '',
        website: gym.website || '',
        location: gym.location || '',
        gym_details: gym.gym_details || '',
        services: gym.services || [],
        status: gym.status || 'pending',
      });
      setErrors({});
    }
  }, [gym]);

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'gym_name':
        if (!value || value.trim().length < 3 || value.trim().length > 100) {
          return 'ชื่อยิมต้องมีความยาว 3-100 ตัวอักษร';
        }
        break;
      case 'contact_name':
        if (!value || value.trim().length < 2 || value.trim().length > 100) {
          return 'ชื่อผู้ติดต่อต้องมีความยาว 2-100 ตัวอักษร';
        }
        break;
      case 'phone':
        if (!value) {
          return 'กรุณากรอกเบอร์โทรศัพท์';
        }
        const phoneRegex = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ตัวอย่าง: 02-123-4567 หรือ 0812345678)';
        }
        break;
      case 'email':
        if (!value) {
          return 'กรุณากรอกอีเมล';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        break;
      case 'website':
        if (value) {
          try {
            new URL(value);
          } catch {
            return 'รูปแบบ URL ไม่ถูกต้อง';
          }
        }
        break;
      case 'location':
        if (!value || value.trim().length < 10) {
          return 'ที่อยู่ต้องมีความยาวอย่างน้อย 10 ตัวอักษร';
        }
        break;
    }
    return undefined;
  };

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleAddService = () => {
    if (serviceInput.trim() && !formData.services.includes(serviceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, serviceInput.trim()],
      }));
      setServiceInput('');
    }
  };

  const handleRemoveService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.gym_name = validateField('gym_name', formData.gym_name);
    newErrors.contact_name = validateField('contact_name', formData.contact_name);
    newErrors.phone = validateField('phone', formData.phone);
    newErrors.email = validateField('email', formData.email);
    newErrors.website = validateField('website', formData.website);
    newErrors.location = validateField('location', formData.location);

    // Remove undefined errors
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key as keyof FormErrors] === undefined) {
        delete newErrors[key as keyof FormErrors];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!gym || !validateForm()) return;

    await onSave(gym.id, {
      gym_name: formData.gym_name.trim(),
      contact_name: formData.contact_name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      website: formData.website.trim() || undefined,
      location: formData.location.trim(),
      gym_details: formData.gym_details.trim() || undefined,
      services: formData.services,
      status: formData.status,
    });
  };

  const isFormValid = Object.keys(errors).length === 0 &&
    formData.gym_name.trim() &&
    formData.contact_name.trim() &&
    formData.phone.trim() &&
    formData.email.trim() &&
    formData.location.trim();

  if (!gym) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-zinc-900 border border-zinc-800',
        header: 'border-b border-zinc-800',
        body: 'py-6',
        footer: 'border-t border-zinc-800',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-white text-xl">แก้ไขข้อมูลยิม</h3>
              <p className="text-default-400 text-sm">{gym.gym_name}</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Gym Name */}
                <Input
                  label="ชื่อยิม"
                  placeholder="กรอกชื่อยิม"
                  value={formData.gym_name}
                  onValueChange={(value) => handleChange('gym_name', value)}
                  isInvalid={!!errors.gym_name}
                  errorMessage={errors.gym_name}
                  isRequired
                  classNames={{
                    input: 'text-white',
                    label: 'text-default-400',
                  }}
                />

                {/* Contact Name */}
                <Input
                  label="ชื่อผู้ติดต่อ"
                  placeholder="กรอกชื่อผู้ติดต่อ"
                  value={formData.contact_name}
                  onValueChange={(value) => handleChange('contact_name', value)}
                  isInvalid={!!errors.contact_name}
                  errorMessage={errors.contact_name}
                  isRequired
                  classNames={{
                    input: 'text-white',
                    label: 'text-default-400',
                  }}
                />

                {/* Phone */}
                <Input
                  label="เบอร์โทรศัพท์"
                  placeholder="02-123-4567 หรือ 0812345678"
                  value={formData.phone}
                  onValueChange={(value) => handleChange('phone', value)}
                  isInvalid={!!errors.phone}
                  errorMessage={errors.phone}
                  isRequired
                  classNames={{
                    input: 'text-white',
                    label: 'text-default-400',
                  }}
                />

                {/* Email */}
                <Input
                  label="อีเมล"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onValueChange={(value) => handleChange('email', value)}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email}
                  isRequired
                  classNames={{
                    input: 'text-white',
                    label: 'text-default-400',
                  }}
                />

                {/* Website */}
                <Input
                  label="เว็บไซต์"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onValueChange={(value) => handleChange('website', value)}
                  isInvalid={!!errors.website}
                  errorMessage={errors.website}
                  classNames={{
                    input: 'text-white',
                    label: 'text-default-400',
                  }}
                />

                {/* Location */}
                <Textarea
                  label="ที่อยู่"
                  placeholder="กรอกที่อยู่ยิม"
                  value={formData.location}
                  onValueChange={(value) => handleChange('location', value)}
                  isInvalid={!!errors.location}
                  errorMessage={errors.location}
                  isRequired
                  minRows={2}
                  classNames={{
                    input: 'text-white',
                    label: 'text-default-400',
                  }}
                />

                {/* Gym Details */}
                <Textarea
                  label="รายละเอียดยิม"
                  placeholder="กรอกรายละเอียดเพิ่มเติม"
                  value={formData.gym_details}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gym_details: value }))}
                  minRows={3}
                  classNames={{
                    input: 'text-white',
                    label: 'text-default-400',
                  }}
                />

                {/* Services */}
                <div>
                  <label className="block mb-2 text-default-400 text-sm">บริการ</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="เพิ่มบริการ"
                      value={serviceInput}
                      onValueChange={setServiceInput}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddService();
                        }
                      }}
                      classNames={{
                        input: 'text-white',
                      }}
                    />
                    <Button
                      color="primary"
                      onPress={handleAddService}
                      isDisabled={!serviceInput.trim()}
                    >
                      เพิ่ม
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.map((service, index) => (
                      <Chip
                        key={index}
                        onClose={() => handleRemoveService(service)}
                        variant="flat"
                        color="primary"
                      >
                        {service}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <Select
                  label="สถานะ"
                  selectedKeys={[formData.status]}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as FormData['status'] }))}
                  classNames={{
                    trigger: 'bg-default-100',
                    label: 'text-default-400',
                    value: 'text-white',
                  }}
                >
                  <SelectItem key="pending">
                    รอการตรวจสอบ
                  </SelectItem>
                  <SelectItem key="approved">
                    อนุมัติแล้ว
                  </SelectItem>
                  <SelectItem key="rejected">
                    ไม่อนุมัติ
                  </SelectItem>
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onClose}
                isDisabled={isProcessing}
              >
                ยกเลิก
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isProcessing}
                isDisabled={!isFormValid || isProcessing}
              >
                บันทึก
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
