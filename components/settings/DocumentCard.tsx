// components/settings/DocumentCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KnowledgeDocument } from '@/types/chat';
import {
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Type,
  Eye,
  EyeOff,
} from 'lucide-react';

interface DocumentCardProps {
  document: KnowledgeDocument;
  onEdit: (document: KnowledgeDocument) => void;
  onDelete: (id: number) => void;
}

export function DocumentCard({
  document,
  onEdit,
  onDelete,
}: DocumentCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${document.title}"? This action cannot be undone.`
      )
    ) {
      onDelete(document.id);
    }
  };

  const contentToShow = showFullContent
    ? document.content
    : document.contentPreview || document.content.substring(0, 200) + '...';

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {document.title}
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(document.createdAt)}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Type className="h-3 w-3 mr-1" />
                  {document.contentLength || document.content.length} chars
                </div>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(document)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Content Preview */}
          <div className="text-sm text-gray-700 leading-relaxed">
            <p className="whitespace-pre-wrap">{contentToShow}</p>
            {document.content.length > 200 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowFullContent(!showFullContent)}
                className="h-auto p-0 mt-2 text-blue-600"
              >
                {showFullContent ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Metadata Tags */}
          <div className="flex flex-wrap gap-1">
            {document.metadata?.category && (
              <Badge variant="secondary" className="text-xs">
                {document.metadata.category}
              </Badge>
            )}
            {document.metadata?.tags &&
              document.metadata.tags
                .split(',')
                .map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag.trim()}
                  </Badge>
                ))}
          </div>

          {/* Updated Date */}
          {document.updatedAt !== document.createdAt && (
            <p className="text-xs text-gray-500">
              Updated: {formatDate(document.updatedAt)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
