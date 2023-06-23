export const fileFilter = (req: Express.Request, files: Express.Multer.File, callback: Function) => {

    if ( !files ) return callback(new Error('File is empty'), false);

    const fileExtension = files.mimetype.split('/')[1];
    const validExtensions = ['jpeg', 'jpg', 'png', 'gif'];

    if (validExtensions.includes(fileExtension)) {
        return callback(null, true)
    }
    
    callback(null, false);
}