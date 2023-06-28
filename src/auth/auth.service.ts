import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto, CreateUserDto } from './dto/index';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService
  ) { }

  async create(createAuthDto: CreateUserDto) {
    try {
      const { password, ...userData } = createAuthDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      this.handleDBerrors(error);
    }
  }

  async loginUser(loginUserDto: LoginUserDto){
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: {email},
      select: { email: true, password: true, id: true }
    })
    if (!user) throw new UnauthorizedException("User or password doesnt match")
    
    const matchPassword = bcrypt.compareSync(password, user.password);

    if (matchPassword) {
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }
    };
     
    throw new UnauthorizedException("User or password doesnt match")
  }

  checkAuthStatus(user: User){
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  private getJwtToken( payload: JwtPayload){
    const token = this.jwtService.sign( payload );
    return token;
  }

 

  private handleDBerrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail)

    console.log(error);
    throw new InternalServerErrorException('Please check server logs')
  }
}
