const express = require('express');
const authMiddleware = require('../middlewares/auth');// Pega a autenticação do usuário e verifica se ele tem permissão para acessar a rota
const User = require('../models/user');
const router = express.Router();
router.use(authMiddleware);
const dotenv = require('dotenv');
dotenv.config();

const jwt = require('jsonwebtoken');

function generateToken(params = {}){
    return jwt.sign(params, process.env.SECRET, {
        expiresIn: 86400,
    });
}

User.updateMany().then(() => {
    console.log('Usuários atualizados com sucesso!');
})

router.get('/', async (req, res) => {
    try {
        let user = await User.findById(req.userId);
        res.status(200).send({user});
        
    } catch (err) {
        return res.status(400).send({error: 'You have no permission to access this page'});
    }
});

router.get('/userlist', async (req, res) => {
    try {
        let user = await User.findById(req.userId);
        if (user == null || !user.scope.includes('admin') )
            return res.status(400).send({error: 'You must to be a admin to access this page'});
        let users = await User.find();
        res.status(200).send({users});
        
    } catch (err) {
        return res.status(400).send({error: 'You have no permission to access this page'});
    }
});

router.put('/:userID', async (req, res) => {
    const {name, email, projetos, password, active} = req.body;
    try{
        let user = await User.findById(req.userId);
        let userToUpdate = await User.findById(req.params.userID);

        if  ( user == null )
            return res.status(400).send({error: 'You must to be logged in to access this page'});
        
        if  (userToUpdate == null)
            return res.status(400).send({error: 'User not found'});

        if (!user.scope.includes('admin') ) // Verifica se o usuário é admin
            return res.status(401).send({error: 'You must to be a admin to access this content'});

        // Não pode remover o cargo de um administrador
        /* if (userToUpdate.scope.includes('admin') && !scope.includes('admin') ){
            scope.push('admin');
        } */
        let userUpdated = await User.findByIdAndUpdate( req.params.userID, {
            email,
            name,
            projetos,
            password,
            active
        }, { new: true });

        userUpdated.save()

        res.status(200).send({userUpdated});

    } catch (err) {
        return res.status(400).send({error: JSON.stringify(err)});
    }
})

router.delete('/:userID', async (req, res) => {
    try {
        let user = await User.findById(req.userId);
        if (user == null || !user.scope.includes('admin') )
            return res.status(401).send({error: 'You must to be a admin to access this content'});
        if (user._id == req.params.userID)
            return res.status(400).send({error: 'Você não pode se deletar, seu louco!'});
        await User.findByIdAndRemove(req.params.userID);
        let users = await User.find();
        res.status(200).send({users});
        
    } catch (err) {
        console.log(err)
        return res.status(401).send({error: 'You have no permission to access this page'});
    }
});

router.post('/logout', async (req, res) => {
    try {

    let user = await User.findById(req.userId);
    generateToken({ id: user.id });
    return res.send({ok: true});
    } catch (err) {
        return res.status(400).send({error: 'You are not logged in'});
    }
})

module.exports = app => app.use('/user', router);