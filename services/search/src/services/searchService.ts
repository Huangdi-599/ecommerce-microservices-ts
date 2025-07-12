import { ElasticsearchService, SearchFilters, SearchOptions, SearchResult } from './elasticsearchService';
import { SearchIndex } from '../models/SearchIndex';
import axios from 'axios';

export interface IndexingRequest {
  documentId: string;
  documentType: 'product' | 'category' | 'review';
  service: string;
}

export interface BulkIndexingRequest {
  documents: IndexingRequest[];
}

export class SearchService {
  private elasticsearchService: ElasticsearchService;

  constructor() {
    this.elasticsearchService = new ElasticsearchService();
  }

  /**
   * Initialize search service
   */
  async initialize(): Promise<void> {
    try {
      await this.elasticsearchService.initializeIndices();
      console.log('✅ Search service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize search service:', error);
      throw error;
    }
  }

  /**
   * Search products with advanced filtering
   */
  async searchProducts(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<{
    results: SearchResult[];
    total: number;
    page: number;
    totalPages: number;
    aggregations?: any;
  }> {
    try {
      const result = await this.elasticsearchService.searchProducts(query, filters, options);
      
      // Add aggregations for faceted search
      const aggregations = await this.getProductAggregations(filters);
      
      return {
        ...result,
        aggregations
      };
    } catch (error) {
      console.error('❌ Product search failed:', error);
      throw error;
    }
  }

  /**
   * Search categories
   */
  async searchCategories(query: string): Promise<SearchResult[]> {
    try {
      return await this.elasticsearchService.searchCategories(query);
    } catch (error) {
      console.error('❌ Category search failed:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, type: 'product' | 'category' = 'product'): Promise<string[]> {
    try {
      return await this.elasticsearchService.getSuggestions(query, type);
    } catch (error) {
      console.error('❌ Suggestions failed:', error);
      return [];
    }
  }

  /**
   * Index a document from external service
   */
  async indexDocument(request: IndexingRequest): Promise<void> {
    try {
      const { documentId, documentType, service } = request;

      // Fetch document from source service
      const document = await this.fetchDocumentFromService(documentId, documentType, service);
      
      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      // Index in Elasticsearch
      await this.indexInElasticsearch(document, documentType);

      // Update indexing status
      await this.updateIndexStatus(documentId, documentType, service, 'indexed');

      console.log(`✅ Successfully indexed ${documentType}: ${documentId}`);
    } catch (error) {
      console.error(`❌ Failed to index ${request.documentType} ${request.documentId}:`, error);
      
      // Update indexing status with error
      await this.updateIndexStatus(request.documentId, request.documentType, request.service, 'failed', error.message);
      
      throw error;
    }
  }

  /**
   * Bulk index documents
   */
  async bulkIndexDocuments(request: BulkIndexingRequest): Promise<{
    success: number;
    failed: number;
    errors: Array<{ documentId: string; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ documentId: string; error: string }>
    };

    for (const document of request.documents) {
      try {
        await this.indexDocument(document);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          documentId: document.documentId,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Remove document from index
   */
  async removeDocument(documentId: string, documentType: 'product' | 'category' | 'review'): Promise<void> {
    try {
      await this.elasticsearchService.deleteDocument(documentId, documentType);
      
      // Remove from indexing status
      await SearchIndex.findOneAndDelete({
        documentId,
        documentType,
        service: this.getServiceName(documentType)
      });

      console.log(`✅ Successfully removed ${documentType}: ${documentId}`);
    } catch (error) {
      console.error(`❌ Failed to remove ${documentType} ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Update document in index
   */
  async updateDocument(documentId: string, documentType: 'product' | 'category' | 'review'): Promise<void> {
    try {
      const service = this.getServiceName(documentType);
      
      // Fetch updated document
      const document = await this.fetchDocumentFromService(documentId, documentType, service);
      
      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      // Update in Elasticsearch
      await this.elasticsearchService.updateDocument(documentId, documentType, document);

      // Update indexing status
      await this.updateIndexStatus(documentId, documentType, service, 'indexed');

      console.log(`✅ Successfully updated ${documentType}: ${documentId}`);
    } catch (error) {
      console.error(`❌ Failed to update ${documentType} ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get indexing status
   */
  async getIndexingStatus(filters: {
    documentType?: 'product' | 'category' | 'review';
    service?: string;
    status?: 'indexed' | 'pending' | 'failed';
  } = {}): Promise<{
    documents: any[];
    total: number;
  }> {
    try {
      const query: any = {};
      
      if (filters.documentType) query.documentType = filters.documentType;
      if (filters.service) query.service = filters.service;
      if (filters.status) query.status = filters.status;

      const documents = await SearchIndex.find(query).sort({ updatedAt: -1 });
      const total = await SearchIndex.countDocuments(query);

      return { documents, total };
    } catch (error) {
      console.error('❌ Failed to get indexing status:', error);
      throw error;
    }
  }

  /**
   * Reindex all documents from a service
   */
  async reindexService(service: string, documentType: 'product' | 'category' | 'review'): Promise<{
    success: number;
    failed: number;
    errors: Array<{ documentId: string; error: string }>;
  }> {
    try {
      // Fetch all documents from service
      const documents = await this.fetchAllDocumentsFromService(service, documentType);
      
      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ documentId: string; error: string }>
      };

      for (const document of documents) {
        try {
          await this.indexInElasticsearch(document, documentType);
          await this.updateIndexStatus(document._id, documentType, service, 'indexed');
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            documentId: document._id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error(`❌ Failed to reindex ${service} ${documentType}s:`, error);
      throw error;
    }
  }

  /**
   * Get search statistics
   */
  async getSearchStats(): Promise<any> {
    try {
      const [indexStats, healthStatus] = await Promise.all([
        this.elasticsearchService.getIndexStats(),
        this.elasticsearchService.healthCheck()
      ]);

      return {
        indexStats,
        healthStatus,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get search stats:', error);
      throw error;
    }
  }

  /**
   * Fetch document from external service
   */
  private async fetchDocumentFromService(
    documentId: string,
    documentType: 'product' | 'category' | 'review',
    service: string
  ): Promise<any> {
    try {
      const serviceUrl = this.getServiceUrl(service);
      const endpoint = this.getEndpoint(documentType);
      
      const response = await axios.get(`${serviceUrl}${endpoint}/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch ${documentType} from ${service}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all documents from service
   */
  private async fetchAllDocumentsFromService(
    service: string,
    documentType: 'product' | 'category' | 'review'
  ): Promise<any[]> {
    try {
      const serviceUrl = this.getServiceUrl(service);
      const endpoint = this.getEndpoint(documentType);
      
      const response = await axios.get(`${serviceUrl}${endpoint}`);
      return response.data.documents || response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch all ${documentType}s from ${service}:`, error);
      throw error;
    }
  }

  /**
   * Index document in Elasticsearch
   */
  private async indexInElasticsearch(document: any, documentType: 'product' | 'category' | 'review'): Promise<void> {
    switch (documentType) {
      case 'product':
        await this.elasticsearchService.indexProduct(document);
        break;
      case 'category':
        await this.elasticsearchService.indexCategory(document);
        break;
      case 'review':
        await this.elasticsearchService.indexReview(document);
        break;
      default:
        throw new Error(`Unknown document type: ${documentType}`);
    }
  }

  /**
   * Update indexing status in database
   */
  private async updateIndexStatus(
    documentId: string,
    documentType: 'product' | 'category' | 'review',
    service: string,
    status: 'indexed' | 'pending' | 'failed',
    error?: string
  ): Promise<void> {
    await SearchIndex.findOneAndUpdate(
      { documentId, documentType, service },
      {
        status,
        error,
        lastUpdated: new Date(),
        ...(status === 'indexed' && { indexedAt: new Date() })
      },
      { upsert: true }
    );
  }

  /**
   * Get product aggregations for faceted search
   */
  private async getProductAggregations(filters: SearchFilters): Promise<any> {
    // This would typically query Elasticsearch for aggregations
    // For now, return empty object
    return {};
  }

  /**
   * Get service URL from environment
   */
  private getServiceUrl(service: string): string {
    const serviceUrls: { [key: string]: string } = {
      'product-service': process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
      'review-service': process.env.REVIEW_SERVICE_URL || 'http://localhost:3006'
    };

    return serviceUrls[service] || `http://localhost:3000`;
  }

  /**
   * Get API endpoint for document type
   */
  private getEndpoint(documentType: 'product' | 'category' | 'review'): string {
    const endpoints: { [key: string]: string } = {
      'product': '/api/products',
      'category': '/api/categories',
      'review': '/api/reviews'
    };

    return endpoints[documentType] || '/api';
  }

  /**
   * Get service name for document type
   */
  private getServiceName(documentType: 'product' | 'category' | 'review'): string {
    const serviceNames: { [key: string]: string } = {
      'product': 'product-service',
      'category': 'product-service',
      'review': 'review-service'
    };

    return serviceNames[documentType] || 'unknown-service';
  }
} 