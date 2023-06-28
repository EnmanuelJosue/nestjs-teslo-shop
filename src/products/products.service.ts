import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { FilesService } from 'src/files/files.service';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger= new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImagerepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

    private readonly filesService: FilesService


  ){}

  async create(createProductDto: CreateProductDto, user: User, files?: Array<Express.Multer.File>) {
    try {
      if(files && files.length){
        const { secureUrls } = this.filesService.returnSecurityUrls(files);
        createProductDto = {
          ...createProductDto,
          images: secureUrls
        }
      }
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        user,
        images: images.map( image => this.productImagerepository.create({ url: image }))
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      const { secureUrls } = this.filesService.returnSecurityUrls(files);
      const paths = secureUrls.map(images => images.split('product/')[1]);
      paths.map(url => this.filesService.deleteStaticProductImage(url));
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDTO) {
    const { limit = 10 , offset = 0 } = paginationDto;
    const product = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });
    return product.map( ({images, ...rest}) => ({
      ...rest,
      images: images.map( img => img.url)
    }))
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: term.toUpperCase(), 
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }    
    if (!product) throw new NotFoundException(`Not found product by term: '${term}'`);
    return product;
  }

  async findOnePlain(term: string){
    const { images= [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }

  async update(
    id: string, 
    updateProductDto: UpdateProductDto,  
    user: User,
    files?: Array<Express.Multer.File>
    ) 
  {
    if(files && files.length){
      const { secureUrls } = this.filesService.returnSecurityUrls(files);
      updateProductDto = {
        ...updateProductDto,
        images: secureUrls
      }
    }
    const { images, ...toUpdate } = updateProductDto;
    
    const product = await this.productRepository.preload({
      id,
      ...toUpdate
    })
    if (!product) throw new NotFoundException(`Not found product by id: '${id}'`);

    //Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();


    try {
      let imagesFind: ProductImage[];
      if (images) {
        
        imagesFind = await queryRunner.manager.findBy(ProductImage, {
          product: {
            id
          }
        });
        
        
        await queryRunner.manager.delete( ProductImage, {
          product: {
            id
          }
        });
        
        product.images = images.map(image => this.productImagerepository.create({url: image}))
      }
      product.user = user;
      await queryRunner.manager.save( product );

      if (imagesFind) {
        const paths = imagesFind.map(images => images.url.split('product/')[1]);
        paths.map(url => this.filesService.deleteStaticProductImage(url));
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
      // return await this.productRepository.save(product);
    } catch (error) {
      if (images) {
        const { secureUrls } = this.filesService.returnSecurityUrls(files);
        const paths = secureUrls.map(images => images.split('product/')[1]);
        paths.map(url => this.filesService.deleteStaticProductImage(url));
      }
     
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    const paths = product.images.map(images => images.url.split('product/')[1]);
    paths.map(url => this.filesService.deleteStaticProductImage(url));
    await this.productRepository.remove(product);
  }

  private handleExceptions(error: any){
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexcpected server error, check logs');
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
      .delete()
      .where({})
      .execute();
      
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
