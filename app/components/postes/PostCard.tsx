"use client";

import React from "react";
import { Card, CardBody, Chip, Button, Tooltip } from "@heroui/react";
import { FiEdit } from "react-icons/fi";
import { FaRegTrashCan } from "react-icons/fa6";

import { PostData } from "./validations";

interface Post extends PostData{
    id:string;
    name:string;
}
interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
  
}

const PostCard: React.FC<PostCardProps> = ({
    post,
    onEdit,
    onDelete,
}) => {
  const getPermissionChips = () => {
    const permissions = [];
    if (post.deposit) permissions.push({ key: "deposit", label: "Dépôt", color: "success" as const, icon: "💰" });
    if (post.withdrawal) permissions.push({ key: "withdrawal", label: "Retrait", color: "warning" as const, icon: "💸" });
    if (post.transfert) permissions.push({ key: "transfer", label: "Transfert", color: "primary" as const, icon: "🔄" });
    return permissions;
  };

  return (
    <Card className="shadow-md hover:shadow-lg hover:border border-green-200 transition-shadow ">
      <CardBody className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-800 mb-1">{post.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
            </div>
            <div className="flex gap-1 ml-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="text-green-600 hover:bg-green-50"
                  onPress={() => onEdit(post)}
                >
                  <FiEdit className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => onDelete(post)}
                >
                  <FaRegTrashCan className="w-4 h-4" />
                </Button>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Permissions</div>
            <div className="flex flex-wrap gap-1">
              {getPermissionChips().length > 0 ? (
                getPermissionChips().map((permission) => (
                  <Chip
                    key={permission.key}
                    color={permission.color}
                    variant="flat"
                    size="sm"
                    startContent={<span className="text-xs">{permission.icon}</span>}
                    classNames={{ content: "text-xs font-medium" }}
                  >
                    {permission.label}
                  </Chip>
                ))
              ) : (
                <Chip size="sm" variant="flat" color="default" classNames={{ content: "text-xs" }}>
                  Aucune permission
                </Chip>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default PostCard;
