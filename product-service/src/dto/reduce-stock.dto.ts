import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReduceStockDto {
  @ApiProperty({ example: 2, description: 'Quantity to reduce from stock' })
  @IsInt()
  @Min(1)
  quantity: number;
}
