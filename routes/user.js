const express = require('express')
const path = require('path');
const userController = require('../controllers/user')
const router = express.Router();
const User = require('../models/user')

router.get('/dreamlist', (req,res,next)=>{
    //console.log(req.session)
    if(!req.session.userId){
        res.render('homepage', {username:"", logged:false})
    }else{
        User.findById(req.session.userId).then(user=>{
            //console.log(user)
            res.render('dreamlist', {username: user.username, items:user.items})
        })
    }
})

router.post('/dreamlist', userController.user_item_post)

router.get('/dreamlist/delete', userController.user_item_delete);

router.post('/dreamlist/update', userController.user_item_update)

router.get('/logout', (req,res,next)=>{
    if(req.session){
        req.session.destroy(err=>{
            if(err) return next(err)

            return  res.redirect('dreamlist');
        })
    }
})

router.get('/login', (req,res,next)=>{
    res.render('login', {errors: 'Login now'})
})

router.post('/login', userController.user_login_post)

router.get('/register', (req,res,next)=>{
    //console.log(req.session)
    if(req.session.errors){
        res.render('register', {errors:req.session.errors});
    }else{
         res.render('register', {errors:['Register']});
    }
})

router.post('/register', userController.user_register_post)

module.exports = router;