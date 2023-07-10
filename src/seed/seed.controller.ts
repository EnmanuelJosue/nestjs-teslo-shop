import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}
  @Get()
  // @Auth(ValidRoles.superUser, ValidRoles.admin)
  @ApiResponse({status: 200, description: 'This created a products Seed'})
  executedSeed(
  ){
    return this.seedService.runSeed();
  }

 
}
