import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {

    @ApiProperty(
        {
            example: '17d2b9ab-69ed-4a15-aa75-eabb4c37d251',
            description: 'Product id',
            uniqueItems: true
        }
    )
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty(
        {
            example: 'T-Shirt Testlo',
            description: 'Product Title',
            uniqueItems: true
        }
    )
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty(
        {
            example: 0,
            description: 'Product price'
        }
    )
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty(
        {
            example: 'Lorem impsum',
            description: 'Product description',
            default:null
        }
    )
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty(
        {
            example: 't_shirt_teslo',
            description: 'Product SLUG - FOR SEO',
            uniqueItems: true
        }
    )
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty(
        {
            example: 10,
            description: 'Product stock',
            default: 0
        }
    )
    @Column('int',{
        default: 0
    })
    stock: number;

    @ApiProperty(
        {
            example: ['M', 'XL'],
            description: 'Product size'
        }
    )
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty(
        {
            example: 'women',
            description: 'Product gender'
        }
    )
    @Column('text')
    gender: string;

    @ApiProperty(
        {
            example: ['short'],
            description: 'Product tags',
            default: []
        }
    )
    @Column('text', {
        array: true,
        default: []

    })
    tags: string[];

    @ManyToOne(
        () => User,
        ( user ) => user.product,
        {eager: true}
    )
    user: User;

    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @BeforeInsert()
    // @BeforeUpdate()
    checkSlugInsert(){
        if (!this.slug) {
            this.slug = this.title;
        }
        this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'",'')
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'",'')
    }
}
