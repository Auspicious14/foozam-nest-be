import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsBoolean,
  IsArray,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RecognizeFoodDto {
  @ApiProperty({ type: "string", format: "binary" })
  @IsOptional()
  image?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class FeedbackDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  recognitionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  correctFoodName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  correctOrigin: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  correctIngredients?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  correctDescription?: string;
}

export class UpdateHistoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  historyId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class GetUserHistoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}
