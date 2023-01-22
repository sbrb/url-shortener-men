import express from 'express';
import mongoose from 'mongoose';
import route from './routes/route.js';
import 'dotenv/config';
const app = express();

app.use(express.json());
const PORT = process.env.PORT;

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB, {
    useNewUrlParser: true
}).then(() => console.log('MongoDb is connected'))
    .catch(err => console.log(err));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log(`ip ${req.ip}`)
    next();
});

app.use('/', route);

app.use((req, res) => res.status(400).send({ status: false, message: `'${req.url}' this URL is Invalid.` }));
app.listen(PORT, () => console.log(`Express app is running on port ${PORT}`));