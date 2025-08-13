// hooks/useDocuments.ts
import { useState, useCallback } from 'react';
import {
  KnowledgeDocument,
  NewKnowledgeDocument,
  DocumentSearchResult,
  DocumentStats,
} from '@/types/chat';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DocumentStats | null>(null);

  // Fetch all documents
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/agent-settings/documents`);
      const result = await response.json();

      if (result.success) {
        setDocuments(result.data);
      } else {
        toast.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add new document
  const addDocument = useCallback(async (document: NewKnowledgeDocument) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/agent-settings/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      });

      const result = await response.json();

      if (result.success) {
        setDocuments((prev) => [result.data, ...prev]);
        toast.success('Document added successfully');
        return result.data;
      } else {
        toast.error(result.error || 'Failed to add document');
        return null;
      }
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update document
  const updateDocument = useCallback(
    async (id: number, updates: Partial<NewKnowledgeDocument>) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/api/agent-settings/documents/${id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          }
        );

        const result = await response.json();

        if (result.success) {
          setDocuments((prev) =>
            prev.map((doc) => (doc.id === id ? result.data : doc))
          );
          toast.success('Document updated successfully');
          return result.data;
        } else {
          toast.error(result.error || 'Failed to update document');
          return null;
        }
      } catch (error) {
        console.error('Error updating document:', error);
        toast.error('Failed to update document');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Delete document
  const deleteDocument = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/agent-settings/documents/${id}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (result.success) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        toast.success('Document deleted successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to delete document');
        return false;
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search documents
  const searchDocuments = useCallback(
    async (query: string, limit: number = 5) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/api/agent-settings/documents/search`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, limit }),
          }
        );

        const result = await response.json();

        if (result.success) {
          return result.data as DocumentSearchResult[];
        } else {
          toast.error(result.error || 'Failed to search documents');
          return [];
        }
      } catch (error) {
        console.error('Error searching documents:', error);
        toast.error('Failed to search documents');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/agent-settings/stats`);
      const result = await response.json();

      if (result.success && result.data.knowledgeBase) {
        setStats(result.data.knowledgeBase);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Get document by ID
  const getDocument = useCallback(async (id: number) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/agent-settings/documents/${id}`
      );
      const result = await response.json();

      if (result.success) {
        return result.data as KnowledgeDocument;
      } else {
        toast.error(result.error || 'Failed to fetch document');
        return null;
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to fetch document');
      return null;
    }
  }, []);

  return {
    documents,
    stats,
    isLoading,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    searchDocuments,
    fetchStats,
    getDocument,
  };
};
