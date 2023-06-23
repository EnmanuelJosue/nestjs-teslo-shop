import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDTO{
    
    @IsOptional()
    @IsPositive()
    @Type( () => Number)
    limit?: number;

    @IsOptional()
    @Min(0)
    @IsNumber()
    @Type( () => Number)
    offset?: number;
}