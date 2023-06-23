import { FilesInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './index';
import { diskStorage } from 'multer';

export const uploadProductImages = (field: string) => {
    return FilesInterceptor(field, undefined , {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer
      })
    })
  }