const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).send({ error: 'No token provided' });

    const parts = authHeader.split(' ');

    if(!parts.lenght === 2)
        return res.status(401).send({error: 'Token error'})

    const [scheme, token] = parts;

    if(!/^Bearer$/i.test(scheme))
        return res.status(401).send({error: 'Token malformatted'})

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) return res.status(401).send({error: 'Invalid token'});
        req.userId = decoded.id;
        return next();
    })
};