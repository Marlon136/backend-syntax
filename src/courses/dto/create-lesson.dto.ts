import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  content!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}
