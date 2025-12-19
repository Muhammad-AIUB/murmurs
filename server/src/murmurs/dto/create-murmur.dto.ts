import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMurmurDto {
  @IsString()
  @IsNotEmpty({ message: 'Text cannot be empty' })
  @MaxLength(500, { message: 'Murmur text cannot exceed 500 characters' })
  text!: string;
}
