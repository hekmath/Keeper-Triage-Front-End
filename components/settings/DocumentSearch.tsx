// components/settings/DocumentSearch.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DocumentSearchResult } from '@/types/chat';
import { Search, Brain, FileText } from 'lucide-react';

interface DocumentSearchProps {
  onSearch: (query: string, limit?: number) => Promise<DocumentSearchResult[]>;
  isLoading?: boolean;
}

export function DocumentSearch({
  onSearch,
  isLoading = false,
}: DocumentSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocumentSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setHasSearched(true);
    const searchResults = await onSearch(query.trim(), 5);
    setResults(searchResults);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle>Semantic Search</CardTitle>
            <p className="text-sm text-gray-600">
              Test how the AI will find relevant documents for customer
              questions
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question like a customer would..."
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            {hasSearched && (
              <Button variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  Search Results ({results.length})
                </h4>
                {query && (
                  <Badge variant="outline" className="text-xs">
                    Query: "{query}"
                  </Badge>
                )}
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No relevant documents found</p>
                  <p className="text-xs mt-1">
                    The AI couldn't find any documents matching your query
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <Card
                      key={result.id}
                      className="border-l-4 border-l-purple-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900">
                            {result.title}
                          </h5>
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-700 text-xs"
                          >
                            {Math.round(result.similarity * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {result.content.substring(0, 200)}
                          {result.content.length > 200 && '...'}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex space-x-2">
                            {result.metadata?.category && (
                              <Badge variant="outline" className="text-xs">
                                {result.metadata.category}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            Rank #{index + 1}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>💡 Tip:</strong> This search uses the same AI technology
              that powers customer responses. Try asking questions like "How do
              I return an item?" or "What's your shipping policy?" to see which
              documents the AI will use.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
