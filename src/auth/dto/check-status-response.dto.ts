import { ApiProperty } from "@nestjs/swagger";
import { User } from "../entities/user.entity";

export class CheckStatusResponseDto{
    @ApiProperty()
    user: User;
    
    @ApiProperty()
    token: string;
}