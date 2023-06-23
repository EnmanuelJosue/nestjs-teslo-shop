import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';

import { uploadProductImages } from 'src/files/helpers/index';
import { FilesService } from 'src/files/files.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService, private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(uploadProductImages('images'))
  create(
    @UploadedFiles() images: Array<Express.Multer.File>, 
    @Body() createProductDto: CreateProductDto
  ) {
    return this.productsService.create(createProductDto, images);
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
  @UseInterceptors(uploadProductImages('images'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Body() updateProductDto: UpdateProductDto) 
    {
      return this.productsService.update(id, updateProductDto, images);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
