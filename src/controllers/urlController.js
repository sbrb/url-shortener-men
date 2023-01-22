import shortid from 'shortid';
import validUrl from 'valid-url';
import axios from 'axios';
import urlModel from '../models/urlModel.js';
import { isValidUrl, isValidBody } from '../util/validator.js';
import { SET_ASYNC, GET_ASYNC } from '../caching/redis.js';

//createUrl
export const createUrl = async (req, res) => {
    try {
        const { longUrl } = req.body;
        if (!isValidBody(req.body)) return res.status(400).send({ status: false, message: 'Please enter data on the body.' });
        if (!isValidUrl(longUrl)) return res.status(400).send({ status: false, message: ` '${longUrl}' this url isn't valid.` });
        if (!validUrl.isUri(longUrl)) return res.status(400).send({ status: false, message: 'Please enter valid url' });

        //existsCache
        let existsCache = await GET_ASYNC(`${longUrl}`);
        existsCache = JSON.parse(existsCache);
        if (existsCache) {
            const fromCache = {
                longUrl: existsCache.longUrl,
                shortUrl: existsCache.shortUrl,
                urlCode: existsCache.urlCode
            };
            if (existsCache) return res.status(200).send({ status: true, message: 'From cache.', data: fromCache });
        };

        //existUrl
        let existUrl = await urlModel.findOne({ longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });
        if (existUrl) return res.status(200).send({ status: true, message: 'From database.', data: existUrl });

        //axios call 
        let liveLink = false
        await axios.get(longUrl)
            .then((res) => { if (res.status == 200 || res.status == 201) liveLink = true })
            .catch(() => liveLink = false);
        if (liveLink == false) return res.status(400).send({ status: false, message: `'${longUrl}' this longUrl does not exist` });

        //shortUrlGenerator
        let urlCode = shortid.generate().toLowerCase();
        const shortUrl = `http://localhost:3000/${urlCode}`;
        const data = {
            longUrl: longUrl,
            shortUrl: shortUrl,
            urlCode: urlCode
        };

        //newUrl
        const newUrl = await urlModel.create(data);
        const savaData = {
            longUrl: newUrl.longUrl,
            shortUrl: newUrl.shortUrl,
            urlCode: newUrl.urlCode
        }
        return res.status(201).send({ status: true, message: 'ShortUrl created successfully.', data: savaData });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: false, error: err.message });
    }
};

//getUrl
export const getUrl = async (req, res) => {
    try {
        const urlCode = req.params.urlCode;
        if (!shortid.isValid(urlCode)) return res.status(400).send({ status: false, message: `'${urlCode}' this shortUrl is invalid` });

        //existsCache
        let existsCache = await GET_ASYNC(`${urlCode}`);
        existsCache = JSON.parse(existsCache);
        if (existsCache) return res.status(302).redirect(existsCache.longUrl);

        //existUrl
        const existUrl = await urlModel.findOne({ urlCode });
        if (!existUrl) return res.status(404).send({ message: `No url found by this '${urlCode}' shortid.` });

        //setCache
        await SET_ASYNC(`${urlCode, existUrl.longUrl}`, JSON.stringify(existUrl));
        return res.status(302).redirect(existUrl.longUrl);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: false, error: err.message });
    }
};
