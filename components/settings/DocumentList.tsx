// components/settings/DocumentList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DocumentCard } from './DocumentCard';
import { KnowledgeDocument, DocumentStats } from '@/types/chat';
import {
  FileText,
  Plus,
  Search,
  Filter,
  BarChart3,
  Folder,
  Clock,
} from 'lucide-react';

interface DocumentListProps {
  documents: KnowledgeDocument[];
  stats: DocumentStats | null;
  isLoading: boolean;
  onEdit: (document: KnowledgeDocument) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

export function DocumentList({
  documents,
  stats,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [filteredDocuments, setFilteredDocuments] =
    useState<KnowledgeDocument[]>(documents);

  // Extract unique categories from documents
  const categories = Array.from(
    new Set(documents.map((doc) => doc.metadata?.category).filter(Boolean))
  ) as string[];

  // Filter documents based on search term and category
  useEffect(() => {
    let filtered = documents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.metadata?.tags?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(
        (doc) => doc.metadata?.category === categoryFilter
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, categoryFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
  };

  if (isLoading && documents.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">in knowledge base</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Content Length
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgContentLength}</div>
              <p className="text-xs text-muted-foreground">
                characters per document
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Documents
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentDocuments}</div>
              <p className="text-xs text-muted-foreground">
                added in last 7 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Folder className="h-5 w-5" />
                <span>Knowledge Base Documents</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage documents that the AI uses to answer customer questions
              </p>
            </div>
            <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search documents by title, content, or tags..."
                  className="pl-10"
                />
              </div>
            </div>

            {categories.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(searchTerm || categoryFilter) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {(searchTerm || categoryFilter) && (
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary">Search: "{searchTerm}"</Badge>
              )}
              {categoryFilter && (
                <Badge variant="secondary">Category: {categoryFilter}</Badge>
              )}
            </div>
          )}

          {/* Document Grid */}
          <div className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {documents.length === 0
                    ? 'No documents yet'
                    : 'No documents found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {documents.length === 0
                    ? 'Add your first document to get started with the knowledge base'
                    : 'Try adjusting your search terms or filters'}
                </p>
                {documents.length === 0 && (
                  <Button
                    onClick={onAdd}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Document
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredDocuments.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Results Summary */}
          {filteredDocuments.length > 0 &&
            documents.length > filteredDocuments.length && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing {filteredDocuments.length} of {documents.length}{' '}
                documents
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
