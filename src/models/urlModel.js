import mongoose from 'mongoose';

export default mongoose.model('Url', new mongoose.Schema(
    {
        longUrl: { type: String, require: true, trim: true },
        shortUrl: { type: String, require: true, trim: true, unique: true, },
        urlCode: { type: String, require: true, lowercase: true, trim: true, unique: true, }
    }, { timestamps: true }
));
