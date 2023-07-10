import { ApiProperty } from "@nestjs/swagger";

export class UserLoginResponseDto {

    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;
    
    @ApiProperty()
    token: string;
}