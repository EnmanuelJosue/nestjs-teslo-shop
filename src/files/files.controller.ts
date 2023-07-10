
import { diskStorage } from 'multer';
import { Response } from 'express';

import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Res, UploadedFiles, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers/index';
import { uploadProductImages } from './helpers/filesInterceptor.helper';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileUploadDto, FilesUploadDto} from './dto/index';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: {fileSize: 1000 }
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product image file',
    type: FileUploadDto,
  })
  @ApiResponse({status: 201, description: 'Files was created'})
  @ApiResponse({status: 400, description: 'File o files is required, only accepted images'})
  uploadProductImage(
    @UploadedFile() 
    file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('File is required, only accepted images');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    return {
      secureUrl
    }
  }

  @Post('product/images')
  @UseInterceptors(uploadProductImages('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product image files',
    type: FilesUploadDto,
  })
  uploadProductImages(
    @UploadedFiles() 
    files: Array<Express.Multer.File>
  ) {
    return this.filesService.returnSecurityUrls(files);
    
  }


  @Get('product/:imageName')
  @ApiResponse({status: 200, description: 'Get imagen for product'})
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ){
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Delete('image/:image')
  @ApiResponse({status: 200, description: 'Delete image for product'})
  deleteImage(
    @Param('image') imageName: string
  ){
    this.filesService.deleteStaticProductImage(imageName);
    
  }
}
