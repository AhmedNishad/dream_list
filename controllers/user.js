const mongoose = require('mongoose')
const User = require('../models/user')
const {body, validationResult, check} = require('express-validator/check')
const {sanitizeBody} = require('express-validator/filter')

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function hasUser(user){
    return new Promise(function(resolve, reject){
        
        User.find({username: user}).then(user=>{
            if(!(isEmpty(user))){
                resolve('Username taken')
            }
            resolve('')
        })
    })
}

function hasEmail(email){
    return new Promise(function(resolve, reject){
        
        User.find({email: email}).then(user=>{
            if(!(isEmpty(user))){
                resolve('Email Taken')
            }
            resolve('')
        })
    })
}

exports.user_item_post = [
    sanitizeBody('*').escape(),

    (req,res,next)=>{
        let userItem = {
            item_name: req.body.item_name,
            item_description: req.body.item_description,
            item_price: req.body.item_price
        }
        User.findById(req.session.userId).exec((err,user)=>{
            if(err){
                return next(err)
            }
            user.items.push(userItem)
            //console.log("pushed"+user.password)
            user.save(err=>{
                if(err){
                    return next(err)
                }
               // console.log("saved" + user.password)
                 return res.redirect('dreamlist');
            })
        })
    }
]

exports.user_login_post = [
    check('username', "please enter your UserName").isLength({min:1}),
    check('username').custom( value=> !/\s/.test(value)).withMessage('No spaces allowed in Username'),
    check('password').custom( value=> !/\s/.test(value)).withMessage('No spaces allowed in Password'),
    sanitizeBody('*').trim().escape(),

    (req,res,next)=>{
        let result = validationResult(req)
        if(!result.isEmpty()){
            return res.render('login', {errors: result.array()})
        }else{
        User.authenticate(req.body.username, req.body.password, (err, user)=>{
            /* console.log(user) */
            if(err || !user){
                console.log(user)
                let error = new Error('Wrong username or password');
                return next(error)
            }
            req.session.userId = user._id
            console.log(req.session)
            return  res.redirect('dreamlist');
        })

        }
    }
]

exports.user_register_post = [

    check('username', "Please enter User Name").isLength({min:1}),
    check('username').custom( value=> !/\s/.test(value)).withMessage('No spaces allowed in Username'),
    check('password').custom( value=> !/\s/.test(value)).withMessage('No spaces allowed in Password'),
    check('email', "Enter valid email").isEmail(),
    sanitizeBody('*').escape(),

    (req,res,next)=>{
        
        let result = validationResult(req)
        if(!result.isEmpty()){
            res.render('register',{errors: result.array()})
        }

        let newUser = new User({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            items:[]
        })

        Promise.all([hasUser(req.body.username), hasEmail(req.body.email)]).then(function(data){
            let hasIssues = false
            data.forEach(result=>{
                if(result != ""){
                    hasIssues = true
                }
            })
            if(!hasIssues){
                req.session.errors = ["Registration Success! Login now"]
                newUser.save()
            }else{
                req.session.errors = data
            }
            res.redirect('register');
            return next()
        })
      
        
    }
]

exports.user_item_delete = (req,res,next)=>{
    User.find({username: req.query.username}).then(users=>{
        users[0].items.id(req.query.item_id).remove()
        users[0].save()
        
        return res.redirect('/user/dreamlist');
    }).catch(err=>{
        console.log(err)
    })
}

exports.user_item_update = [
    sanitizeBody('*').trim().escape(),

    (req, res, next)=>{
        let newItem = {
            item_name: req.body.item_name,
            item_description: req.body.item_description,
            item_price: req.body.item_price
        }
        User.findById(req.session.userId).then(user=>{
            let relevantItem =  user.items.id(req.body.item_id)
            relevantItem.set(newItem)
            user.save()
            return res.redirect('/user/dreamlist');
        })
    }
]