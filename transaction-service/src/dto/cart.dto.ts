import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'ID of the product to add' })
  @IsInt()
  @Min(1)
  product_id: number;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartDto {
  @ApiProperty({ example: 3, description: 'New quantity of the product' })
  @IsInt()
  @Min(1)
  quantity: number;
}
