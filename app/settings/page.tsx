// app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DocumentForm } from '@/components/settings/DocumentForm';
import { DocumentList } from '@/components/settings/DocumentList';
import { DocumentSearch } from '@/components/settings/DocumentSearch';
import { Navigation } from '@/components/common/Navigation';

import { KnowledgeDocument, NewKnowledgeDocument } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocument';

export default function SettingsPage() {
  const {
    documents,
    stats,
    isLoading,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    searchDocuments,
    fetchStats,
  } = useDocuments();

  const [editingDocument, setEditingDocument] =
    useState<KnowledgeDocument | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [fetchDocuments, fetchStats]);

  const handleAddDocument = async (data: NewKnowledgeDocument) => {
    const success = await addDocument(data);
    if (success) {
      setShowForm(false);
      fetchStats(); // Refresh stats
    }
  };

  const handleUpdateDocument = async (data: NewKnowledgeDocument) => {
    if (!editingDocument) return;

    const success = await updateDocument(editingDocument.id, data);
    if (success) {
      setEditingDocument(null);
      fetchStats(); // Refresh stats
    }
  };

  const handleDeleteDocument = async (id: number) => {
    const success = await deleteDocument(id);
    if (success) {
      fetchStats(); // Refresh stats
    }
  };

  const handleEditDocument = (document: KnowledgeDocument) => {
    setEditingDocument(document);
    setShowForm(false); // Hide add form if open
  };

  const handleCancelEdit = () => {
    setEditingDocument(null);
  };

  const handleShowAddForm = () => {
    setShowForm(true);
    setEditingDocument(null); // Clear edit mode
  };

  const handleCancelAdd = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-20 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Knowledge Base Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage documents that power AI responses to customer questions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add/Edit Document Form */}
            {(showForm || editingDocument) && (
              <DocumentForm
                document={editingDocument}
                onSubmit={
                  editingDocument ? handleUpdateDocument : handleAddDocument
                }
                onCancel={editingDocument ? handleCancelEdit : handleCancelAdd}
                isLoading={isLoading}
              />
            )}

            {/* Document Search */}
            <DocumentSearch onSearch={searchDocuments} isLoading={isLoading} />
          </div>

          {/* Right Column - Document List */}
          <div className="lg:col-span-2">
            <DocumentList
              documents={documents}
              stats={stats}
              isLoading={isLoading}
              onEdit={handleEditDocument}
              onDelete={handleDeleteDocument}
              onAdd={handleShowAddForm}
            />
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              • When customers ask questions, the AI searches through these
              documents to find relevant information
            </p>
            <p>
              • Documents are automatically converted to vector embeddings for
              semantic search
            </p>
            <p>
              • Use the search tool above to test how well your documents match
              customer queries
            </p>
            <p>
              • Keep documents focused and well-organized for best AI
              performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
