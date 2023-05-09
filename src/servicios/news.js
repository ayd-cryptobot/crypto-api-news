const express = require('express')

const endpoints = express.Router()
const axios = require('axios')
//database    
const nodeCron = require("node-cron");
let mysqlpro = require('mysql2/promise');
const dotenv = require('dotenv')
dotenv.config({path: '.env'})
//database    
//connection variable 
let con
async function PromiseConnection() {
  con = await mysqlpro.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
  });

}

let result;
//account variables
let crypto_name;
async function createFollow(user_id, crypto_name) {
try{
  let i = 0;
  while (i < crypto_name.length) {

    let sql = "INSERT INTO follow (user_id,crypto_name) VALUES ('" + user_id + "','" + crypto_name[i] + "');";
    result = await con.query(sql)
    console.log("1 follow inserted");

    i++;
  }
}catch(error)
  {
    console.log(error)
    return
  }


}

async function resetFollow(user_id) {
  try {
    let sql = "SELECT id_string FROM follow WHERE  (user_id='" + user_id + "')";
    result = await con.query(sql)
  }
  catch (err) {
    console.log("new follow")
    return
  }
  try {
    let sql = "DELETE FROM follow WHERE(user_id='" + user_id + "');";
    result = await con.query(sql)

    console.log("1 follow inserted");
  }catch(error)
  {
    console.log(error)
    return
  }

}

async function getUserByTelegram(telegram_id) {
  try {
  let rta;
  let sql = "SELECT user_id FROM user WHERE  (telegram_id='" + telegram_id + "')";

  result = await con.query(sql)

  rta = await (result[0][0].user_id)

  console.log(rta + "rta")

  return rta;
  }catch(error)
  {
    console.log(error)
    return
  }
}


endpoints.post('/news/follow', async (req, res) => {
  console.log(req.body, "este es el body")

  try {
    //const buff = Buffer.from(req.body.message.data, 'base64');
    //const buff = Buffer.from(req.body.message.data, 'base64');
    const buff = req.body;
    //const id=buff.toString('utf-8')
    const id = buff;

    crypto_name = id.following_cryptos;
    await PromiseConnection();

    console.log("Connected!");
    const user_id = await getUserByTelegram(id.telegram_id);
    await resetFollow(user_id);
    await createFollow(user_id, crypto_name);
    res.json({ "message": "follows inserted" });
    res.end();
  } catch(err)
  {
    console.log(err)
    res.json({ "message": "follow error" });
    res.end();
  }
})


async function notify(user_id) {
  try {
    let user_id = user_id;
    let array_crypto = [];
    let filter = "";
    let sql;

    console.log("Connected!");

    sql = "SELECT crypto_name FROM follow WHERE  (user_id='" + user_id + "')";
    const [rows] = await con.query(sql)
    result = rows
    console.log(JSON.stringify(result) + "query check");
    for (let crypto_rta of result) {
      array_crypto.push(crypto_rta.crypto_name);

    }


    if (array_crypto && array_crypto.length > 0) {
      crypto = Math.floor(Math.random() * (array_crypto.length - 0)) + 0;
      const newsurl = 'https://newsapi.org/v2/everything?q= crypto AND ' + array_crypto[crypto] + '&language=es&sortBy=popularity&apiKey=3b67b1606d934062b206f3f9e56307fb'
      console.log(newsurl)
      const urlAPI = await axios.get(newsurl)
      const datos = await urlAPI.data.articles
      let notice


      if (0 < datos.length) {
        notice = Math.floor(Math.random() * (datos.length - 0)) + 0;
        filter = filter + " \n " + datos[notice].title + ":  \n " + datos[notice].url
      };


    }
    return filter

  } catch (error) {
    console.log(error)
    return
  }
}
async function usersQuery(sql) {
  console.log(sql + "outworks")
  let users_array = []

  result = await con.query(sql)
  if (result[0]) {
    for (let users of result[0]) {
      let notification = await notify(users.user_id)
      let message = "CRYPTO NEWS \ud83d\udcb8 \n" + notification 
      if (notification) {
        message = {
          chat_id: users.telegram_id,
          message
        }
        if (message) {
         await  publishNotify(JSON.stringify(message))
           users_array.push(JSON.stringify(message))
        }
      }

    }
  }


  console.log(users_array+"check")

  // })
  return users_array
}

async function schedule() {
  try {
    let users_array = []
      try {
          let sql = "SELECT user_id, telegram_id FROM user ;"
          let array = await usersQuery(sql)  
          if (array && array != null && array != "null" && array.length > 0) {
             users_array.push(array)
  
          }

      }

      catch (error) { console.log(error) }
    

    return  users_array;
  }
  catch (err) {
    console.log(err)
  }
}

endpoints.get('/news/notification', async (req, res) => {
  await PromiseConnection();
  try {

    res.json(await schedule())
    res.end()
  }
  catch (err) {
    console.log(err)
    res.json("internal fuction error")
    res.end()
  }

})


//LISTAR NOTICIAS PARA LA PAGINA WEB
endpoints.get('/news/consult', async (req, res) => {
  try {
    const urlAPI = 'https://newsapi.org/v2/everything?q=crypto&language=es&sortBy=popularity&apiKey=3b67b1606d934062b206f3f9e56307fb';
    console.log(urlAPI);
    const respuestaAPI = await axios.get(urlAPI)
    let datos = await respuestaAPI.data.articles

    let notice
    let filter = [];

    if (0 < datos.length) {
      let i = 0;
      while (i < 10) {
        notice = Math.floor(Math.random() * (datos.length - 0)) + 0;
        if (notice > -1 && notice < datos.length) {
        datos.splice(notice, 1);
        }
        console.log(notice)

        filter.push({
          //"chat_id":chat,
          "title": datos[notice].title,
          "description": datos[notice].description,
          "image": datos[notice].urlToImage,
          "link": datos[notice].url

        })
        i++;
      }
    };

    console.log(filter)
    if (datos && datos.length > 0) {
      res.json({ "message": filter })

    }
    else
      res.json({ "mensaje": "no hay datos" })

    res.end()
  }
  catch (err) {
    console.log(err)
    res.json("error")
    res.end()
  }
})

endpoints.post('/news/accounts/event', async (req, res) => {
  try {

    const buff = Buffer.from(req.body.message.data, 'base64');
    const id = JSON.parse(buff.toString('utf-8'))
    console.log(id, "este es el body")
    await PromiseConnection();
    
    try {
      let operation_type = id.operation_type
      console.log(operation_type);
    }
    catch (err) {
      res.json("invalid operation")
      res.end()
    }
    console.log("Connected!");
    let telegram_user_id = id.telegram_user_id
    
    switch (operation_type) {

      case ("create"):
        
        var sql = "INSERT INTO user (telegram_id) VALUES ('" + telegram_user_id + "');";
        result = await con.query(sql)
        await res.json({ "message": "account created" });

        break;

      case ("update"):


        await res.json({ "message": "ok" });
        break;

      case ("delete"):
        var sql = "DELETE FROM user WHERE (telegram_id='" + telegram_user_id + "');";
        result = await con.query(sql)
        await res.json({ "message": "account deleted" });

        break;

      default:
        await res.json({ "error": "event not found" });

        break;
    }

    res.end()
  }
  catch (err) {
    console.log(err)
    await res.json("error")

    res.end()
  }
})
//gcloud auth application-default login   
/**
 * TODO(developer): Uncomment these variables before running the sample.
 */

// Imports the Google Cloud client library
const { PubSub } = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
const pubSubClient = new PubSub();
 GOOGLE_APPLICATION_CREDENTIALS = '.\cryptobot-345516'
async function publishMessage(messaging) {
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(messaging);

  try {
    const messageId = await pubSubClient
      .topic("projects/cryptobot-345516/topics/accounts-events-topic")
      .publishMessage({ data: dataBuffer });
    console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    process.exitCode = 1;
  }
}

async function publishNotify(messaging) {
  try {
    // converts buffer from messaging
    const dataBuffer = Buffer.from(messaging);


    const messageId = await pubSubClient
      //topic data
      .topic("projects/cryptobot-345516/topics/news-events-topic")
      .publishMessage({ data: dataBuffer });

    console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    process.exitCode = 1;
  }
}
module.exports = endpoints