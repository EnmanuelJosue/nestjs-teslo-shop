import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const GetRawHeaders = createParamDecorator( 
    (data: string, ctx: ExecutionContext) =>   {
        const req = ctx.switchToHttp().getRequest();
        const rawHeaders = req.rawHeaders;        

        if ( !rawHeaders ) throw new InternalServerErrorException('Row headers not found (request)')
        
        return rawHeaders;
    }
);