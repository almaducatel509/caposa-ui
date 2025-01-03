'use client';
import React, { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Input } from "@nextui-org/react";

const EditHoursModal = ({ hour, onClose, onSave }: { hour: any; onClose: () => void; onSave: (updatedHour: any) => void }) => {
  const [formData, setFormData] = useState(hour);

  const handleChange = (key: keyof typeof hour, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal isOpen onClose={onClose}>
      <ModalHeader>Edit Opening Hour</ModalHeader>
      <ModalBody>
        <Input
          label="Monday"
          value={formData.monday}
          onChange={(e) => handleChange("monday", e.target.value)}
        />
        {/* Add other inputs for Tuesday-Friday */}
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditHoursModal;
