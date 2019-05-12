const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const itemSchema = new Schema({
    item_name: {type:String, required:true, trim:true},
    item_description: {type:String, trim:true},
    item_price: {type: Number, required:true, trim:true}
})

const userSchema = new Schema({
    username: {type:String, required:true, max:50, trim:true},
    email: {type:String, required:true, max:50, trim: true},
    password: {type:String, required:true},
    items: [itemSchema]
})

userSchema.static('authenticate',function(username, password, cb){
    userModel.find({username: username})
    .exec((err, users)=>{
        let user = users[0]
        if(err) {return cb(err)}
        else if(!user || users.length<1){
            let error = new Error('User not found')
            error.status = 401;
            return cb(error,null)
        }else{
        bcrypt.compare(password, user.password, (err, result)=>{
            if(result == true){
                return cb(null, user)
            }else{
                return cb()
            }
        })
        }
    })
})

userSchema.pre('findById', function(next){
    let user= this;
    if(!user.items){
        user.items = []
    }
    next()
})

userSchema.pre('save', function(next){
        let user = this;
        if(!user.isModified('password')){
            return next()
        } 
        bcrypt.hash(user.password, 10, (err, hash)=>{            
            if(err){
                return next(err)
            }
            user.password = hash;
            
            return next()
        })
        
})

const userModel = mongoose.model('user',userSchema)

module.exports = userModel;