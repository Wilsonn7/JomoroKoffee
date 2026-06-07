import { IsInt, IsOptional, IsString, Min, Max, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MinWords } from '../common/validators/min-words.validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Es Kopi Susu', description: 'Product name (minimum 3 words)' })
  @MinWords(3)
  name: string;

  @ApiProperty({ example: 'Kopi susu gula aren yang sangat segar dan nikmat sekali', description: 'Product description (minimum 20 characters)' })
  @MinLength(20)
  description: string;

  @ApiProperty({ example: 18000, description: 'Price (integer, minimum 1)' })
  @IsInt()
  @Min(1)
  price: number;

  @ApiProperty({ example: 100, description: 'Available stock (integer, 0 to 999)' })
  @IsInt()
  @Min(0)
  @Max(999)
  stock: number;

  @ApiProperty({ example: 'http://example.com/kopi.jpg', required: false, description: 'Product image URL (optional)' })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: 1, description: 'Category ID (integer)' })
  @IsInt()
  category_id: number;
}
