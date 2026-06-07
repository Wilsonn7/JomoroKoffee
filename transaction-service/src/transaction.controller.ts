import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { AddToCartDto, UpdateCartDto } from './dto/cart.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@ApiTags('Transactions')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // ==================== CART ENDPOINTS ====================

  @Get('cart')
  @ApiOperation({ summary: 'Get current user cart items' })
  @ApiResponse({ status: 200, description: 'Return cart items enriched with product details' })
  async getCart(@Request() req: any) {
    return this.transactionService.getCart(req.user.id);
  }

  @Post('cart')
  @ApiOperation({ summary: 'Add product to cart' })
  @ApiResponse({ status: 201, description: 'Product added to cart successfully' })
  @ApiResponse({ status: 400, description: 'Validation error, insufficient stock, or duplicate item' })
  async addToCart(@Request() req: any, @Body() addToCartDto: AddToCartDto) {
    return this.transactionService.addToCart(req.user.id, addToCartDto.product_id, addToCartDto.quantity);
  }

  @Post('cart/:product_id/update')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock or validation error' })
  @ApiResponse({ status: 404, description: 'Cart item or product not found' })
  async updateCartItem(
    @Request() req: any,
    @Param('product_id', ParseIntPipe) productId: number,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.transactionService.updateCartItem(req.user.id, productId, updateCartDto.quantity);
  }

  @Post('cart/:product_id/delete')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Cart item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async deleteCartItem(
    @Request() req: any,
    @Param('product_id', ParseIntPipe) productId: number,
  ) {
    return this.transactionService.deleteCartItem(req.user.id, productId);
  }

  @Post('cart/clear')
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@Request() req: any) {
    return this.transactionService.clearCart(req.user.id);
  }

  // ==================== ORDER ENDPOINTS ====================

  @Get('orders')
  @ApiOperation({ summary: 'Get all user orders' })
  @ApiResponse({ status: 200, description: 'Return order history list' })
  async getOrders(@Request() req: any) {
    return this.transactionService.getOrders(req.user.id);
  }

  @Post('orders/:id')
  @ApiOperation({ summary: 'Get details of a specific order (POST request as specified)' })
  @ApiResponse({ status: 200, description: 'Return order details enriched with product names' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderDetails(
    @Request() req: any,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    return this.transactionService.getOrderDetails(req.user.id, orderId);
  }

  @Get('profiles')
  @ApiOperation({ summary: 'Get user profile (via Auth-Service proxy)' })
  @ApiResponse({ status: 200, description: 'Return user details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserProfile(@Request() req: any, @Headers('authorization') token: string) {
    return this.transactionService.getUserProfile(req.user.id, token);
  }

  // ==================== CHECKOUT ====================

  @Post('orders')
  @ApiOperation({ summary: 'Checkout cart to create order and reduce stock' })
  @ApiResponse({ status: 201, description: 'Checkout successful' })
  @ApiResponse({ status: 400, description: 'Empty cart or stock validation failure' })
  async checkout(@Request() req: any, @Headers('authorization') token: string) {
    return this.transactionService.checkout(req.user.id, token);
  }
}
