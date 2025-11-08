import { useState, useEffect } from "react";
import { Input, Textarea, Switch, Select, SelectItem } from "@heroui/react";
import AdminFormModal from "../shared/AdminFormModal";
import { Event } from "@/types";

export interface EventUpdateData {
  slug: string;
  name: string;
  name_english?: string;
  description?: string;
  details?: string;
  event_date: string;
  end_date?: string;
  location: string;
  address?: string;
  price_start?: number;
  max_attendees?: number;
  status: string;
  is_featured: boolean;
  is_published: boolean;
}

interface EventEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (eventId: string, data: EventUpdateData) => Promise<boolean>;
  event: Event | null;
  isProcessing: boolean;
}

export default function EventEditModal({
  isOpen,
  onClose,
  onUpdate,
  event,
  isProcessing,
}: EventEditModalProps) {
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

  useEffect(() => {
    if (event) {
      const eventDate = event.event_date || event.date || "";
      const formattedDate = eventDate
        ? new Date(eventDate).toISOString().slice(0, 16)
        : "";
      const endDate = event.end_date
        ? new Date(event.end_date).toISOString().slice(0, 16)
        : "";

      setFormData({
        slug: event.slug || "",
        name: event.name || "",
        name_english: event.name_english || "",
        description: event.description || "",
        details: event.details || "",
        event_date: formattedDate,
        end_date: endDate,
        location: event.location || "",
        address: event.address || "",
        price_start:
          event.price_start?.toString() || event.price?.toString() || "",
        max_attendees: event.max_attendees?.toString() || "",
        status: event.status || "upcoming",
        is_featured: event.is_featured || false,
        is_published: event.is_published || false,
      });
      setErrors({});
    }
  }, [event]);

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
    if (!validateForm() || !event) return;

    const eventData = {
      slug: formData.slug.trim(),
      name: formData.name.trim(),
      name_english: formData.name_english.trim() || undefined,
      description: formData.description.trim() || undefined,
      details: formData.details.trim() || undefined,
      event_date: new Date(formData.event_date).toISOString(),
      end_date: formData.end_date
        ? new Date(formData.end_date).toISOString()
        : undefined,
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

    const success = await onUpdate(event.id, eventData);
    if (success) {
      onClose();
    }
  };

  if (!event) return null;

  return (
    <AdminFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="แก้ไขอีเวนต์"
      size="3xl"
      onSubmit={handleSubmit}
      isProcessing={isProcessing}
      isFormValid={validateForm()}
      submitText="บันทึกการแก้ไข"
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
