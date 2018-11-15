const mongoose = require('mongoose');
const { Schema } = mongoose;


const questionSchema = new Schema({
    question:{
        id:Number,
        prompt:String,
        answer:String,
        answered:Boolean,
        level:Number
    }
 });

const Question = mongoose.model('Question',questionSchema);

module.export = {
    Question:Question
}
//wont overwrite existing collections, just add if it does not exist
//const mongoLevel = mongoose.model('question', questionSchema);
