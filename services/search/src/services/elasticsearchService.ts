import { Client } from '@elastic/elasticsearch';
import axios from 'axios';

export interface SearchResult {
  id: string;
  type: 'product' | 'category' | 'review';
  score: number;
  data: any;
  highlights?: any;
}

export interface SearchFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  inStock?: boolean;
  brand?: string;
  tags?: string[];
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fuzzy?: boolean;
  highlight?: boolean;
}

export class ElasticsearchService {
  private client: Client;
  private indexPrefix: string;

  constructor() {
    this.indexPrefix = process.env.ELASTICSEARCH_INDEX_PREFIX || 'ecommerce';
    
    this.client = new Client({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async initializeIndices(): Promise<void> {
    try {
      await this.createProductsIndex();
      await this.createCategoriesIndex();
      await this.createReviewsIndex();
      console.log('✅ Elasticsearch indices initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Elasticsearch indices:', error);
      throw error;
    }
  }

  private async createProductsIndex(): Promise<void> {
    const indexName = `${this.indexPrefix}_products`;
    
    const exists = await this.client.indices.exists({ index: indexName });
    if (exists) return;

    await this.client.indices.create({
      index: indexName,
      body: {
        settings: {
          analysis: {
            analyzer: {
              product_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'stop', 'snowball']
              }
            }
          }
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { 
              type: 'text',
              analyzer: 'product_analyzer',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            description: { 
              type: 'text',
              analyzer: 'product_analyzer'
            },
            category: { type: 'keyword' },
            brand: { type: 'keyword' },
            price: { type: 'float' },
            originalPrice: { type: 'float' },
            discount: { type: 'float' },
            rating: { type: 'float' },
            reviewCount: { type: 'integer' },
            inStock: { type: 'boolean' },
            stockQuantity: { type: 'integer' },
            tags: { type: 'keyword' },
            images: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    });
  }

  private async createCategoriesIndex(): Promise<void> {
    const indexName = `${this.indexPrefix}_categories`;
    
    const exists = await this.client.indices.exists({ index: indexName });
    if (exists) return;

    await this.client.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { 
              type: 'text',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            description: { type: 'text' },
            parentId: { type: 'keyword' },
            slug: { type: 'keyword' },
            image: { type: 'keyword' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    });
  }

  private async createReviewsIndex(): Promise<void> {
    const indexName = `${this.indexPrefix}_reviews`;
    
    const exists = await this.client.indices.exists({ index: indexName });
    if (exists) return;

    await this.client.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            productId: { type: 'keyword' },
            userId: { type: 'keyword' },
            rating: { type: 'integer' },
            title: { type: 'text' },
            content: { type: 'text' },
            helpful: { type: 'integer' },
            verified: { type: 'boolean' },
            status: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' }
          }
        }
      }
    });
  }

  async indexProduct(product: any): Promise<void> {
    try {
      const indexName = `${this.indexPrefix}_products`;
      
      await this.client.index({
        index: indexName,
        id: product._id.toString(),
        body: {
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          category: product.category,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          inStock: product.inStock,
          stockQuantity: product.stockQuantity,
          tags: product.tags || [],
          images: product.images || [],
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      });

      console.log(`✅ Indexed product: ${product._id}`);
    } catch (error) {
      console.error(`❌ Failed to index product ${product._id}:`, error);
      throw error;
    }
  }

  async indexCategory(category: any): Promise<void> {
    try {
      const indexName = `${this.indexPrefix}_categories`;
      
      await this.client.index({
        index: indexName,
        id: category._id.toString(),
        body: {
          id: category._id.toString(),
          name: category.name,
          description: category.description,
          parentId: category.parentId,
          slug: category.slug,
          image: category.image,
          isActive: category.isActive,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }
      });

      console.log(`✅ Indexed category: ${category._id}`);
    } catch (error) {
      console.error(`❌ Failed to index category ${category._id}:`, error);
      throw error;
    }
  }

  async indexReview(review: any): Promise<void> {
    try {
      const indexName = `${this.indexPrefix}_reviews`;
      
      await this.client.index({
        index: indexName,
        id: review._id.toString(),
        body: {
          id: review._id.toString(),
          productId: review.productId.toString(),
          userId: review.userId.toString(),
          rating: review.rating,
          title: review.title,
          content: review.content,
          helpful: review.helpful,
          verified: review.verified,
          status: review.status,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt
        }
      });

      console.log(`✅ Indexed review: ${review._id}`);
    } catch (error) {
      console.error(`❌ Failed to index review ${review._id}:`, error);
      throw error;
    }
  }

  async searchProducts(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<{
    results: SearchResult[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const indexName = `${this.indexPrefix}_products`;
      const { page = 1, limit = 20, sortBy = 'score', sortOrder = 'desc', fuzzy = true, highlight = true } = options;
      
      const must: any[] = [];
      const filter: any[] = [];

      if (query) {
        if (fuzzy) {
          must.push({
            multi_match: {
              query,
              fields: ['name^3', 'description^2', 'brand', 'tags'],
              fuzziness: 'AUTO',
              type: 'best_fields'
            }
          });
        } else {
          must.push({
            multi_match: {
              query,
              fields: ['name^3', 'description^2', 'brand', 'tags'],
              type: 'best_fields'
            }
          });
        }
      }

      if (filters.category) {
        filter.push({ term: { category: filters.category } });
      }

      if (filters.brand) {
        filter.push({ term: { brand: filters.brand } });
      }

      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        const range: any = {};
        if (filters.priceMin !== undefined) range.gte = filters.priceMin;
        if (filters.priceMax !== undefined) range.lte = filters.priceMax;
        filter.push({ range: { price: range } });
      }

      if (filters.rating !== undefined) {
        filter.push({ range: { rating: { gte: filters.rating } } });
      }

      if (filters.inStock !== undefined) {
        filter.push({ term: { inStock: filters.inStock } });
      }

      if (filters.tags && filters.tags.length > 0) {
        filter.push({ terms: { tags: filters.tags } });
      }

      const body: any = {
        query: {
          bool: {
            must,
            filter
          }
        },
        from: (page - 1) * limit,
        size: limit
      };

      if (sortBy === 'price') {
        body.sort = [{ price: { order: sortOrder } }];
      } else if (sortBy === 'rating') {
        body.sort = [{ rating: { order: sortOrder } }];
      } else if (sortBy === 'createdAt') {
        body.sort = [{ createdAt: { order: sortOrder } }];
      } else {
        body.sort = [{ _score: { order: 'desc' } }];
      }

      if (highlight && query) {
        body.highlight = {
          fields: {
            name: {},
            description: {},
            brand: {}
          }
        };
      }

      const response = await this.client.search({
        index: indexName,
        body
      });

      const results: SearchResult[] = response.hits.hits.map((hit: any) => ({
        id: hit._id,
        type: 'product',
        score: hit._score,
        data: hit._source,
        highlights: hit.highlight
      }));

      return {
        results,
        total: response.hits.total.value,
        page,
        totalPages: Math.ceil(response.hits.total.value / limit)
      };
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }

  async searchCategories(query: string): Promise<SearchResult[]> {
    try {
      const indexName = `${this.indexPrefix}_categories`;
      
      const response = await this.client.search({
        index: indexName,
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query,
                    fields: ['name^2', 'description'],
                    fuzziness: 'AUTO'
                  }
                },
                { term: { isActive: true } }
              ]
            }
          },
          size: 20
        }
      });

      return response.hits.hits.map((hit: any) => ({
        id: hit._id,
        type: 'category',
        score: hit._score,
        data: hit._source
      }));
    } catch (error) {
      console.error('❌ Category search failed:', error);
      throw error;
    }
  }

  async getSuggestions(query: string, type: 'product' | 'category' = 'product'): Promise<string[]> {
    try {
      const indexName = `${this.indexPrefix}_${type}s`;
      
      const response = await this.client.search({
        index: indexName,
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query,
                    fields: type === 'product' ? ['name', 'brand'] : ['name'],
                    fuzziness: 'AUTO'
                  }
                }
              ]
            }
          },
          aggs: {
            suggestions: {
              terms: {
                field: type === 'product' ? 'name.keyword' : 'name.keyword',
                size: 10
              }
            }
          },
          size: 0
        }
      });

      return response.aggregations.suggestions.buckets.map((bucket: any) => bucket.key);
    } catch (error) {
      console.error('❌ Suggestions failed:', error);
      return [];
    }
  }

  async deleteDocument(id: string, type: 'product' | 'category' | 'review'): Promise<void> {
    try {
      const indexName = `${this.indexPrefix}_${type}s`;
      
      await this.client.delete({
        index: indexName,
        id
      });

      console.log(`✅ Deleted ${type}: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to delete ${type} ${id}:`, error);
      throw error;
    }
  }

  async updateDocument(id: string, type: 'product' | 'category' | 'review', data: any): Promise<void> {
    try {
      const indexName = `${this.indexPrefix}_${type}s`;
      
      await this.client.update({
        index: indexName,
        id,
        body: {
          doc: data
        }
      });

      console.log(`✅ Updated ${type}: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to update ${type} ${id}:`, error);
      throw error;
    }
  }

  async getIndexStats(): Promise<any> {
    try {
      const indices = [`${this.indexPrefix}_products`, `${this.indexPrefix}_categories`, `${this.indexPrefix}_reviews`];
      
      const response = await this.client.indices.stats({
        index: indices.join(',')
      });

      return response.indices;
    } catch (error) {
      console.error('❌ Failed to get index stats:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.cluster.health();
      return response.status === 'green' || response.status === 'yellow';
    } catch (error) {
      console.error('❌ Elasticsearch health check failed:', error);
      return false;
    }
  }
} 