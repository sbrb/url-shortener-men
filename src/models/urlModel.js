const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
    {
        longUrl: { type: String, require: true, trim: true },
        shortUrl: { type: String, require: true, trim: true, unique: true, },
        urlCode: { type: String, require: true, lowercase: true, trim: true, unique: true, }
    }, { timestamps: true }
);

module.exports = mongoose.model('Url', urlSchema);
