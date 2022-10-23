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
  database: "sys"
});

//account variables
var crypto_name;
    var user_id;


endpoints.post('/news/follow',async(req,res)=> {
    console.log(req.body,"este es el body")


    //const buff = Buffer.from(req.body.message.data, 'base64');
    //const buff = Buffer.from(req.body.message.data, 'base64');
    const buff = req.body;
    //const id=buff.toString('utf-8')
 const id=buff;
//console.log(JSON.parse(id));
    //  first_name=JSON.parse(id).first_name;
    //  last_name=JSON.parse(id).last_name;
    //  email=JSON.parse(id).email;
    //  username=JSON.parse(id).username;
    //  telegram_id=JSON.parse(id).chat_id;
    //  password=JSON.parse(id).password;
    //  rol=JSON.parse(id).rol;
    crypto_name=id.crypto_name;
    user_id=id.user_id;



     con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");

      var sql = "SELECT id_string FROM follow WHERE (crypto_name='"+crypto_name+"') AND (user_id='"+user_id+"')";
      con.query(sql, function (err, result) {
        if (err) {
        console.log("err check");
        //var sql = "INSERT INTO follow ('user_id','crypto_name') VALUES ('user_id',(SELECT user_id FROM user WHERE user_id='"+user_id+"')), ('crypto_name',(SELECT crypto_name FROM crypto WHERE crypto_name='"+crypto_name+"'));";
        var sql = "INSERT INTO follow (user_id,crypto_name) VALUES ('"+user_id+"','"+crypto_name+"');";
      
      
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 follow inserted");
          res.json({"message":"1 follow inserted"});
        });
      }
      else{
        console.log("del check");
      var sql = "DELETE FROM follow WHERE (crypto_name='"+crypto_name+"') AND (user_id='"+user_id+"')";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 follow deleted");
        res.json({"message":"1 follow deleted"});
      });
    }

      });

      
    });
    res.end;


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