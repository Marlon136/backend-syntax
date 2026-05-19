import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsString, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}
