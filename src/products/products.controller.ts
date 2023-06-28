import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';

import { uploadProductImages } from 'src/files/helpers/index';
import { FilesService } from 'src/files/files.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService, private readonly filesService: FilesService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @UseInterceptors(uploadProductImages('images'))
  create(
    @UploadedFiles() images: Array<Express.Multer.File>, 
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.create(createProductDto, user, images);
  }

  @Get()
  findAll(@Query() paginationDTO: PaginationDTO ) {
    console.log(paginationDTO);
    
    return this.productsService.findAll(paginationDTO);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @UseInterceptors(uploadProductImages('images'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
    )
    {
      return this.productsService.update(id, updateProductDto, user, images);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
