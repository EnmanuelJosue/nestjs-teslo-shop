import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDTO{

    @ApiProperty({default: 10, description: 'How many rows do you need'})    
    @IsOptional()
    @IsPositive()
    @Type( () => Number)
    limit?: number;

    @ApiProperty({default: 0, description: 'How many rows do you want to skip'})  
    @IsOptional()
    @Min(0)
    @IsNumber()
    @Type( () => Number)
    offset?: number;
}