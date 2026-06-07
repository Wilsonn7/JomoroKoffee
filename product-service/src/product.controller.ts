import { Controller, Get, Post, Body, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ReduceStockDto } from './dto/reduce-stock.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@ApiTags('Products')
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Return list of all products' })
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details by ID' })
  @ApiResponse({ status: 200, description: 'Return product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductById(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Return list of all categories' })
  async getAllCategories() {
    return this.productService.getAllCategories();
  }

  @Get('categories/:categoryId/products')
  @ApiOperation({ summary: 'Get all products in a specific category' })
  @ApiResponse({ status: 200, description: 'Return list of products in the category' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getProductsByCategoryId(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.productService.getProductsByCategoryId(categoryId);
  }

  // ==================== ADMIN / SECURED ENDPOINTS ====================

  @Post('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Validation or category validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Post('admin/products/:id/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation or category validation error' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: CreateProductDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Post('admin/products/:id/reduce')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CUSTOMER') // Allows customers to reduce stock during checkouts
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reduce product stock (Admin & Customer/System)' })
  @ApiResponse({ status: 200, description: 'Stock reduced successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async reduceStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() reduceStockDto: ReduceStockDto,
  ) {
    return this.productService.reduceStock(id, reduceStockDto.quantity);
  }

  @Post('admin/products/:id/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.deleteProduct(id);
  }
}
