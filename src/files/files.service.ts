import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class FilesService {
  logger = new Logger('FilesService');
  constructor(private readonly configService: ConfigService){}

  getStaticProductImage(imageName: string){
    const path = join(__dirname, '../../static/products', imageName);
    if (!existsSync(path)) {
      throw new BadRequestException(`No product found with image: ${imageName} `);
    }
    return path;
  }

  returnSecurityUrls( files: Array<Express.Multer.File>){
    if (!files.length) {
      throw new BadRequestException('File is required, only accepted images');
    }
    
    const secureUrls = files.map(files => `${this.configService.get('HOST_API')}/files/product/${files.filename}`)
    return {
      secureUrls
    }
  }

  deleteStaticProductImage(imageName: string){
    const filePath = join(__dirname, '../../static/products', imageName);
    try {
      unlinkSync(filePath);
      this.logger.log(`Archivo ${filePath} eliminado con éxito.`);
    } catch (err) {
      this.logger.error(`Error al eliminar el archivo ${filePath}:`, err);
      // throw new BadRequestException(`No product found with image: ${imageName} `);
    }
  }

  
}
