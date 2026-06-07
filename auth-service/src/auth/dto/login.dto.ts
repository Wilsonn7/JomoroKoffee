import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john.doe@gmail.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password12', description: 'User password' })
  @IsNotEmpty()
  password: string;
}
