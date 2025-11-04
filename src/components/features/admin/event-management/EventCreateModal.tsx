import { useState } from "react";
import { Input, Textarea, Switch, Select, SelectItem } from "@heroui/react";
import AdminFormModal from "../shared/AdminFormModal";

interface EventCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<boolean>;
  isProcessing: boolean;
}

export default function EventCreateModal({
  isOpen,
  onClose,
  onCreate,
  isProcessing,
}: EventCreateModalProps) {
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    name_english: "",
    description: "",
    details: "",
    event_date: "",
    end_date: "",
    location: "",
    address: "",
    price_start: "",
    max_attendees: "",
    status: "upcoming",
    is_featured: false,
    is_published: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.slug.trim()) {
      newErrors.slug = "กรุณากรอก slug";
    }
    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่ออีเวนต์";
    }
    if (!formData.event_date) {
      newErrors.event_date = "กรุณาเลือกวันที่จัดงาน";
    }
    if (!formData.location.trim()) {
      newErrors.location = "กรุณากรอกสถานที่";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const eventData = {
      slug: formData.slug.trim(),
      name: formData.name.trim(),
      name_english: formData.name_english.trim() || undefined,
      description: formData.description.trim() || undefined,
      details: formData.details.trim() || undefined,
      event_date: formData.event_date,
      end_date: formData.end_date || undefined,
      location: formData.location.trim(),
      address: formData.address.trim() || undefined,
      price_start: formData.price_start
        ? parseFloat(formData.price_start)
        : undefined,
      max_attendees: formData.max_attendees
        ? parseInt(formData.max_attendees)
        : undefined,
      status: formData.status,
      is_featured: formData.is_featured,
      is_published: formData.is_published,
    };

    const success = await onCreate(eventData);
    if (success) {
      setFormData({
        slug: "",
        name: "",
        name_english: "",
        description: "",
        details: "",
        event_date: "",
        end_date: "",
        location: "",
        address: "",
        price_start: "",
        max_attendees: "",
        status: "upcoming",
        is_featured: false,
        is_published: false,
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <AdminFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="เพิ่มอีเวนต์ใหม่"
      size="3xl"
      onSubmit={handleSubmit}
      isProcessing={isProcessing}
      isFormValid={validateForm()}
      submitText="สร้างอีเวนต์"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Slug"
            placeholder="event-slug"
            value={formData.slug}
            onValueChange={(value) => setFormData({ ...formData, slug: value })}
            errorMessage={errors.slug}
            isInvalid={!!errors.slug}
            isRequired
          />
          <Input
            label="ชื่ออีเวนต์ (ไทย)"
            placeholder="ชื่ออีเวนต์"
            value={formData.name}
            onValueChange={(value) => setFormData({ ...formData, name: value })}
            errorMessage={errors.name}
            isInvalid={!!errors.name}
            isRequired
          />
        </div>

        <Input
          label="ชื่ออีเวนต์ (อังกฤษ)"
          placeholder="Event Name"
          value={formData.name_english}
          onValueChange={(value) =>
            setFormData({ ...formData, name_english: value })
          }
        />

        <Textarea
          label="คำอธิบาย"
          placeholder="คำอธิบายสั้นๆ"
          value={formData.description}
          onValueChange={(value) =>
            setFormData({ ...formData, description: value })
          }
        />

        <Textarea
          label="รายละเอียด"
          placeholder="รายละเอียดอีเวนต์"
          value={formData.details}
          onValueChange={(value) =>
            setFormData({ ...formData, details: value })
          }
          minRows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            label="วันที่จัดงาน"
            value={formData.event_date}
            onValueChange={(value) =>
              setFormData({ ...formData, event_date: value })
            }
            errorMessage={errors.event_date}
            isInvalid={!!errors.event_date}
            isRequired
          />
          <Input
            type="datetime-local"
            label="วันที่สิ้นสุด (ถ้ามี)"
            value={formData.end_date}
            onValueChange={(value) =>
              setFormData({ ...formData, end_date: value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="สถานที่"
            placeholder="สถานที่จัดงาน"
            value={formData.location}
            onValueChange={(value) =>
              setFormData({ ...formData, location: value })
            }
            errorMessage={errors.location}
            isInvalid={!!errors.location}
            isRequired
          />
          <Input
            label="ที่อยู่"
            placeholder="ที่อยู่เต็ม"
            value={formData.address}
            onValueChange={(value) =>
              setFormData({ ...formData, address: value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="ราคาเริ่มต้น"
            placeholder="0"
            value={formData.price_start}
            onValueChange={(value) =>
              setFormData({ ...formData, price_start: value })
            }
            startContent={<span className="text-zinc-400">฿</span>}
          />
          <Input
            type="number"
            label="จำนวนผู้เข้าร่วมสูงสุด"
            placeholder="0"
            value={formData.max_attendees}
            onValueChange={(value) =>
              setFormData({ ...formData, max_attendees: value })
            }
          />
        </div>

        <Select
          label="สถานะ"
          selectedKeys={[formData.status]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            setFormData({ ...formData, status: value });
          }}
        >
          <SelectItem key="upcoming">กำลังจะจัด</SelectItem>
          <SelectItem key="ongoing">กำลังจัด</SelectItem>
          <SelectItem key="completed">เสร็จสิ้น</SelectItem>
          <SelectItem key="cancelled">ยกเลิก</SelectItem>
        </Select>

        <div className="flex gap-4">
          <Switch
            isSelected={formData.is_featured}
            onValueChange={(value) =>
              setFormData({ ...formData, is_featured: value })
            }
          >
            อีเวนต์แนะนำ
          </Switch>
          <Switch
            isSelected={formData.is_published}
            onValueChange={(value) =>
              setFormData({ ...formData, is_published: value })
            }
          >
            เผยแพร่
          </Switch>
        </div>
      </div>
    </AdminFormModal>
  );
}
