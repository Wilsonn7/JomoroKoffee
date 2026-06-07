import { IsAlpha, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword, IsValidDomain } from '../validators/custom-validators';

export class RegisterDto {
  @ApiProperty({ example: 'John', description: 'First name containing alphabetic letters only' })
  @IsAlpha()
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'Last name containing alphabetic letters only' })
  @IsAlpha()
  last_name: string;

  @ApiProperty({ example: 'john.doe@gmail.com', description: 'Email address with a valid domain extension (.com, .net, .org, or .id)' })
  @IsEmail()
  @IsValidDomain()
  email: string;

  @ApiProperty({ example: 'password12', description: 'Password (min 8 chars, no spaces, min 2 numbers)' })
  @IsStrongPassword()
  password: string;
}
