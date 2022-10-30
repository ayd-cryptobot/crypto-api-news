const express = require('express')
const endpoints = express.Router()
const axios = require('axios')
const { response } = require('../server')
const app = express();
module.exports = endpoints

 //database    
var mysql = require('mysql2');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "news"
});

//account variables
var crypto_name;
    var user_id;

    function createFollow(user_id ,crypto_name){
      let i=0;
      while (i<crypto_name.length) {
        var sql = "INSERT INTO follow (user_id,crypto_name) VALUES ('"+user_id+"','"+crypto_name[i]+"');";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 follow inserted");
      });
        i++;
      }
  
      
    }
    function resetFollow(user_id){
     
      var sql = "SELECT id_string FROM follow WHERE  (user_id='"+user_id+"')";
        con.query(sql, function (err, result) {
          if(err)return;
        var sql = "DELETE FROM follow WHERE(user_id='"+user_id+"');";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 follow inserted");
      });
  })
  
      }

endpoints.post('/news/follow',async(req,res)=> {
  console.log(req.body,"este es el body")


  //const buff = Buffer.from(req.body.message.data, 'base64');
  //const buff = Buffer.from(req.body.message.data, 'base64');
  const buff = req.body;
  //const id=buff.toString('utf-8')
const id=buff;

  crypto_name=id.following_cryptos;
  user_id=id.telegram_id;
  currency_pair=id.currency_pair;
   con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  res.json({"message":"follows inserted"});
  resetFollow(user_id);
  createFollow(user_id,crypto_name,currency_pair);

})

})

endpoints.get('/news/notification/:user_id',async(req,res)=> {


    
// const buff = Buffer.from(req.body.message.data, 'base64');

// const id=buff.toString('utf-8')
// const chat= JSON.parse(id).chat_id

let busqueda=req.params.user_id
var coin;

 con.connect( async function(err) {
  if (err) throw err;
  console.log("Connected!");

  var sql = "SELECT crypto_name FROM follow WHERE  (user_id='"+busqueda+"')";
 con.query(sql, async function (err, result) {



    coin=  JSON.stringify(result[Math.floor(Math.random() * (result.length - 0)) + 0].crypto_name);
      const rta=  JSON.parse(coin);
;


const urlAPI = 'https://newsapi.org/v2/everything?q= crypto AND '+rta+'&language=es&sortBy=popularity&apiKey=3b67b1606d934062b206f3f9e56307fb';
console.log(urlAPI);
const respuestaAPI = await axios.get(urlAPI)
const datos = await respuestaAPI.data.articles
const notice =Math.floor(Math.random() * (datos.length - 0)) + 0;
let filter=[1];

    if(0<datos.length){
   filter= {
       //"chat_id":chat,
       "titulo":datos[notice].title ,
       ////"descripcion":datos[i].description,
       "link":datos[notice].url 
  
   }
};
console.log(filter) 
if (datos && datos.length > 0)
{
res.json({
   "message":filter
})
// filter =JSON.stringify(filter);
// publishMessage(filter);
}
else
res.json({"mensaje":"no hay datos"})
  });



});

})

endpoints.get('/news/consult',async(req,res)=> {
  res.json({"mensaje":"criptobot.com/news/consult"})

})

endpoints.post('/news/accounts/event',async(req,res)=> {
  console.log(req.body,"este es el body")


  //const buff = Buffer.from(req.body.message.data, 'base64');
  //const buff = Buffer.from(req.body.message.data, 'base64');
  const buff = req.body.message.data;
  //const id=buff.toString('utf-8')
const id=buff;
try{
var operation_type=id.operation_type
console.log(operation_type);
}
catch(err){
}

   con.connect(async function(err) {
    if (err) throw err;
    console.log("Connected!");

     switch(operation_type){

  case("create"):
 var telegram_user_id=id.telegram_user_id
// var first_name=id.first_name
// var last_name=id.last_name
// var email=id.email
// var username=id.username

//     var sql = "INSERT INTO user (telegram_id,first_name, last_name,email  username,  rol) VALUES ('"+telegram_user_id+"','"+first_name+"','"+ last_name+"','"+ email+"','"+ username+"','cliente');";
var sql = "INSERT INTO user (telegram_id) VALUES ('"+telegram_user_id+"');";
   
con.query(sql,async function (err, result) {
    if (err) throw err;

   await res.json({"message":"account created"});
  });
  break;
  case("edit"):
  var telegram_user_id=id.telegram_user_id
// var first_name=id.first_name
// var last_name=id.last_name
// var email=id.email
// var username=id.username
//     var sql = "UPDATE user SET first_name='"+first_name+"',last_name='"+ last_name+"',email='"+ email+"',username='"+ username+"' WHERE (telegram_id='"+telegram__user_id+"');";
var query_schedule=id.query_schedule;

var sql = "UPDATE user SET query_schedule='"+ query_schedule+"' WHERE (telegram_id='"+telegram__user_id+"');";
   
con.query(sql,async  function (err, result) {

    await res.json({"message":"account edited"});
  });
  break;
  case("delete"):
  var telegram_user_id=id.telegram_user_id
    var sql = "DELETE FROM user WHERE (telegram_id='"+telegram_user_id+"');";
  con.query(sql, async function (err, result) {
    if (err) throw err;

    await res.json({"message":"account deleted"});
  });
  break;  
  default:

   await res.json({"error":"event not found"});
    break;
   }

res.end


})

})