import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class TransactionService {
  private productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
  private authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

  constructor(private prisma: PrismaService) {}

  // Helpers
  private formatAuthHeader(token: string): string {
    if (!token) return '';
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  // ==================== CART ACTIONS ====================

  async getCart(userId: number) {
    let cart = await this.prisma.carts.findFirst({
      where: { user_id: userId },
      include: { cart_items: true },
    });

    if (!cart) {
      cart = await this.prisma.carts.create({
        data: { user_id: userId },
        include: { cart_items: true },
      });
    }

    const items: any[] = [];
    for (const item of cart.cart_items) {
      try {
        const response = await fetch(`${this.productServiceUrl}/products/${item.product_id}`);
        if (!response.ok) {
          // If product doesn't exist anymore on product service, skip or handle accordingly
          continue;
        }
        const product = await response.json();
        items.push({
          product_id: item.product_id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        });
      } catch (error) {
        console.error(`Error fetching product details for ID ${item.product_id}:`, error.message);
      }
    }

    return items;
  }

  async addToCart(userId: number, productId: number, quantity: number) {
    // 1. Fetch product from product-service
    const response = await fetch(`${this.productServiceUrl}/products/${productId}`);
    if (!response.ok) {
      throw new NotFoundException(`Product with ID ${productId} not found in Product Service`);
    }
    const product = await response.json();

    // 2. Validate quantity vs stock
    if (quantity > product.stock) {
      throw new BadRequestException(`Requested quantity (${quantity}) exceeds available stock (${product.stock})`);
    }

    // 3. Find or create user cart
    let cart = await this.prisma.carts.findFirst({
      where: { user_id: userId },
    });
    if (!cart) {
      cart = await this.prisma.carts.create({
        data: { user_id: userId },
      });
    }

    // 4. Check if duplicate
    const existingItem = await this.prisma.cart_items.findFirst({
      where: {
        cart_id: cart.id,
        product_id: productId,
      },
    });
    if (existingItem) {
      throw new BadRequestException(`Product with ID ${productId} is already in the cart. Use update instead.`);
    }

    // 5. Add item
    await this.prisma.cart_items.create({
      data: {
        cart_id: cart.id,
        product_id: productId,
        quantity,
      },
    });

    return { message: 'Item added to cart successfully' };
  }

  async updateCartItem(userId: number, productId: number, quantity: number) {
    // 1. Fetch product from product-service
    const response = await fetch(`${this.productServiceUrl}/products/${productId}`);
    if (!response.ok) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    const product = await response.json();

    // 2. Validate quantity vs stock
    if (quantity > product.stock) {
      throw new BadRequestException(`Requested quantity (${quantity}) exceeds available stock (${product.stock})`);
    }

    // 3. Find cart
    const cart = await this.prisma.carts.findFirst({
      where: { user_id: userId },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found for this user');
    }

    // 4. Find cart item
    const cartItem = await this.prisma.cart_items.findFirst({
      where: {
        cart_id: cart.id,
        product_id: productId,
      },
    });
    if (!cartItem) {
      throw new NotFoundException(`Product with ID ${productId} is not in the cart`);
    }

    // 5. Update quantity
    await this.prisma.cart_items.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    return { message: 'Cart item updated successfully' };
  }

  async deleteCartItem(userId: number, productId: number) {
    const cart = await this.prisma.carts.findFirst({
      where: { user_id: userId },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.prisma.cart_items.findFirst({
      where: {
        cart_id: cart.id,
        product_id: productId,
      },
    });
    if (!cartItem) {
      throw new NotFoundException(`Product with ID ${productId} is not in the cart`);
    }

    await this.prisma.cart_items.delete({
      where: { id: cartItem.id },
    });

    return { message: 'Cart item deleted successfully' };
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.carts.findFirst({
      where: { user_id: userId },
    });
    if (cart) {
      await this.prisma.cart_items.deleteMany({
        where: { cart_id: cart.id },
      });
    }
    return { message: 'Cart cleared successfully' };
  }

  // ==================== ORDER ACTIONS ====================

  async getOrders(userId: number) {
    return this.prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_details: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getOrderDetails(userId: number, orderId: number) {
    const order = await this.prisma.orders.findFirst({
      where: {
        id: orderId,
        user_id: userId,
      },
      include: {
        order_details: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const details: any[] = [];
    for (const detail of order.order_details) {
      let name = 'Unknown Product';
      try {
        const response = await fetch(`${this.productServiceUrl}/products/${detail.product_id}`);
        if (response.ok) {
          const product = await response.json();
          name = product.name;
        }
      } catch (error) {
        console.error(`Error fetching product details for order verification:`, error.message);
      }

      details.push({
        product_id: detail.product_id,
        name,
        quantity: detail.quantity,
        price: detail.price,
      });
    }

    return details;
  }

  async getUserProfile(userId: number, token: string) {
    const authHeader = this.formatAuthHeader(token);
    try {
      const response = await fetch(`${this.authServiceUrl}/auth/profile`, {
        headers: {
          'Authorization': authHeader,
        },
      });

      if (!response.ok) {
        throw new UnauthorizedException('Invalid or expired token, or auth-service unavailable');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new BadRequestException(`Unable to fetch user profile: ${error.message}`);
    }
  }

  // ==================== CHECKOUT ====================

  async checkout(userId: number, token: string) {
    // 1. Get cart
    const cart = await this.prisma.carts.findFirst({
      where: { user_id: userId },
      include: { cart_items: true },
    });

    if (!cart || cart.cart_items.length === 0) {
      throw new BadRequestException('Cart is empty. Cannot checkout.');
    }

    // 2. Validate all products and stock first
    const checkedItems: any[] = [];
    for (const item of cart.cart_items) {
      const response = await fetch(`${this.productServiceUrl}/products/${item.product_id}`);
      if (!response.ok) {
        throw new BadRequestException(`Product ID ${item.product_id} no longer exists. Checkout aborted.`);
      }
      const product = await response.json();

      if (item.quantity > product.stock) {
        throw new BadRequestException(`Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`);
      }

      checkedItems.push({
        product_id: item.product_id,
        price: product.price,
        quantity: item.quantity,
      });
    }

    // 3. Create the order record
    const order = await this.prisma.orders.create({
      data: {
        user_id: userId,
      },
    });

    // 4. Create details and call product-service to reduce stock
    const authHeader = this.formatAuthHeader(token);
    for (const checkedItem of checkedItems) {
      // Create order detail (price snapshot)
      await this.prisma.order_details.create({
        data: {
          order_id: order.id,
          product_id: checkedItem.product_id,
          price: checkedItem.price,
          quantity: checkedItem.quantity,
        },
      });

      // Call reduce stock endpoint on product-service
      const reduceResponse = await fetch(`${this.productServiceUrl}/admin/products/${checkedItem.product_id}/reduce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ quantity: checkedItem.quantity }),
      });

      if (!reduceResponse.ok) {
        const errorText = await reduceResponse.text();
        throw new BadRequestException(`Failed to reduce stock for product ID ${checkedItem.product_id}: ${errorText}`);
      }
    }

    // 5. Clear cart
    await this.prisma.cart_items.deleteMany({
      where: { cart_id: cart.id },
    });

    return { message: 'Checkout successful' };
  }
}
