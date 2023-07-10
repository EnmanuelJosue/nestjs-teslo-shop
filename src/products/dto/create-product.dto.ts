import { ApiBody, ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, MinLength, IsPositive, IsNumber, IsOptional, IsInt, IsArray, IsIn } from "class-validator";

export class CreateProductDto {

    @ApiProperty({
        description: 'Product Title (unique)',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        description: 'Product price',
        required: false,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    price?: number;

    @ApiProperty({
        description: 'Product description',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Product slug',
        required: false,
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        description: 'Product stock',
        required: false,
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    stock?: number;

    @ApiProperty({
        type: [String]
    })
    @IsString({each: true})
    @IsArray()
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    sizes: string[];

    @ApiProperty({
        description: 'Product gender',
        required: true,
    })
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @ApiProperty({
        description: 'Product tags',
        required: false,
       
    })
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    tags: string[];

    @ApiProperty({ 
        type: 'array', 
        items: { 
            type: 'string', 
            format: 'binary' 
        },
        required: false,
        description: 'Product images' 
    })
    @IsString({each: true})
    @IsArray()
    @IsOptional()
    images?: string[];
}
