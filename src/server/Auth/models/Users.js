const bcrypt = require('bcrypt');

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
   email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: {
  type: String, 
  required: true
}
},
 { timestamps: true });

//encrypt password 
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  try{
    const salt =  await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();

  } catch (error){

    next(error);
  }
})

const User = mongoose.model('User', userSchema);
module.exports =  User;
