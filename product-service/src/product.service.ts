import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // Public operations
  async getAllProducts() {
    return this.prisma.products.findMany({
      include: { category: true },
    });
  }

  async getProductById(id: number) {
    const product = await this.prisma.products.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async getAllCategories() {
    return this.prisma.categories.findMany();
  }

  async getProductsByCategoryId(categoryId: number) {
    const categoryExists = await this.prisma.categories.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
    return this.prisma.products.findMany({
      where: { category_id: categoryId },
    });
  }

  // Admin operations
  async createProduct(createProductDto: CreateProductDto) {
    // Validate category exists
    const category = await this.prisma.categories.findUnique({
      where: { id: createProductDto.category_id },
    });
    if (!category) {
      throw new BadRequestException(`Category with ID ${createProductDto.category_id} does not exist`);
    }

    await this.prisma.products.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
        image_url: createProductDto.image_url,
        category_id: createProductDto.category_id,
      },
    });

    return { message: 'Product created successfully' };
  }

  async updateProduct(id: number, updateProductDto: CreateProductDto) {
    // Check if product exists
    await this.getProductById(id);

    // Validate category exists
    const category = await this.prisma.categories.findUnique({
      where: { id: updateProductDto.category_id },
    });
    if (!category) {
      throw new BadRequestException(`Category with ID ${updateProductDto.category_id} does not exist`);
    }

    await this.prisma.products.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        description: updateProductDto.description,
        price: updateProductDto.price,
        stock: updateProductDto.stock,
        image_url: updateProductDto.image_url,
        category_id: updateProductDto.category_id,
      },
    });

    return { message: 'Product updated successfully' };
  }

  async reduceStock(id: number, quantity: number) {
    const product = await this.getProductById(id);

    if (quantity > product.stock) {
      throw new BadRequestException(`Insufficient stock. Available: ${product.stock}, requested: ${quantity}`);
    }

    await this.prisma.products.update({
      where: { id },
      data: {
        stock: product.stock - quantity,
      },
    });

    return { message: 'Stock reduced successfully' };
  }

  async deleteProduct(id: number) {
    await this.getProductById(id);
    await this.prisma.products.delete({
      where: { id },
    });
    return { message: 'Product deleted successfully' };
  }

  // Seeder helper to auto-populate categories if empty
  async seedCategories() {
    const count = await this.prisma.categories.count();
    if (count === 0) {
      await this.prisma.categories.createMany({
        data: [
          { name: 'Coffee' },
          { name: 'Non-Coffee' },
          { name: 'Snack' },
        ],
      });
      console.log('Seeded categories: Coffee, Non-Coffee, Snack');
    }
  }
}
