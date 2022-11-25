const express = require('express')
const endpoints = express.Router()
const axios = require('axios')
//database    

var mysqlpro = require('mysql2/promise');
//database    
//connection variable 
var con
async function PromiseConnection() {
  con = await mysqlpro.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "news"
  });

}
var result;
//account variables
var crypto_name;
var user_id;

async function createFollow(user_id, crypto_name) {
  let i = 0;
  while (i < crypto_name.length) {
    var sql = "INSERT INTO follow (user_id,crypto_name) VALUES ('" + user_id + "','" + crypto_name[i] + "');";
    result = await con.query(sql)
    console.log("1 follow inserted");

    i++;
  }

}

async function resetFollow(user_id) {
  try {
    var sql = "SELECT id_string FROM follow WHERE  (user_id='" + user_id + "')";
    result = await con.query(sql)
  }
  catch (err) {
    console.log("new follow")
    return
  }
  try {
    var sql = "DELETE FROM follow WHERE(user_id='" + user_id + "');";
    result = await con.query(sql)

    console.log("1 follow inserted");
  }
  catch (err) {
    res.json("error on delete")
    res.end
  }
}

async function getUserByTelegram(telegram_id) {
  var rta;
  var sql = "SELECT user_id FROM user WHERE  (telegram_id='" + telegram_id + "')";

  result = await con.query(sql)

  rta = await (result[0][0].user_id)

  console.log(rta + "rta")

  return rta;
}


endpoints.post('/news/follow', async (req, res) => {
  console.log(req.body, "este es el body")
  try {
    await PromiseConnection();

    //const buff = Buffer.from(req.body.message.data, 'base64');
    //const buff = Buffer.from(req.body.message.data, 'base64');
    const buff = req.body;
    //const id=buff.toString('utf-8')
    const id = buff;

    crypto_name = id.following_cryptos;
    telegram_id = id.telegramID;

    console.log("Connected!");

    user_id = await getUserByTelegram(telegram_id)
    await resetFollow(user_id);
    await createFollow(user_id, crypto_name);
    res.json({ "message": "follows inserted" });
    res.end
  }
  catch (err) {
    console.log(err)

    res.end

  }
})


async function notify(user_id) {
  try {
    var user_id = user_id;
    var array_crypto = [];
    let filter = [];
    var sql;

    //conn.execute(async function(err) {

    //  if (err) throw err;

    console.log("Connected!");

    sql = "SELECT crypto_name FROM follow WHERE  (user_id='" + user_id + "')";
    const [rows] = await con.query(sql)
    result = rows
    console.log(JSON.stringify(result) + "query check");
    for (crypto_rta of result) {
      await array_crypto.push(crypto_rta.crypto_name);
      console.log(array_crypto + "check")

    }


    if (array_crypto && array_crypto.length > 0) {
      for (let crypto of array_crypto) {
        const newsurl = 'https://newsapi.org/v2/everything?q= crypto AND ' + crypto + '&language=es&sortBy=popularity&apiKey=3b67b1606d934062b206f3f9e56307fb'
        const urlAPI = await axios.get(newsurl)
        const datos = await urlAPI.data.articles
        console.log(datos);
        var notice
        

        if (0 < datos.length) {
          i = 0;
         
            notice = Math.floor(Math.random() * (datos.length - 0)) + 0;
            console.log(notice)
            filter.push({
              //"chat_id":chat,
              "title": datos[notice].title,
              "description": datos[notice].description,
              "image": datos[notice].urlToImage,
              "link": datos[notice].url

            })
            i++;
          
        };

      }
    }
  return filter

  } catch (error) {
    console.log(error)
    return
  }
}
async function usersQuery(sql) {
  console.log(sql + "outworks")
  var users_array = []
  // await nodeCron.schedule(query_schedule, async () => {
  console.log(sql + "works")
  result = await con.query(sql)
  if (result[0]) {
    for (users of result[0]) {
      var notification = await notify(users.user_id)
      if (notification) {
        message = {
          user: users.telegram_id,
          news: notification

        }
        if (message) {
          await users_array.push(message)
        }
      }

    }
  }


  console.log(users_array)

  // })
  return users_array
}

async function schedule() {
  var users_array = []
  array_query = ["*/30 * * * *", "* */1 * * *", "* */2 * * *"]
  for (query_schedule of array_query) {
    try {
      sql = "SELECT user_id, telegram_id FROM user WHERE query_schedule='" + query_schedule + "';"
      var array = await usersQuery(sql)
      if (array && array !== null && array !== "null" && array.length > 0) {
        await users_array.push(array[0])
      }
    }
    catch (error) { console.log(error) }
  }


  return await users_array;
}

endpoints.get('/news/notification', async (req, res) => {
  await PromiseConnection();
  try {

    res.json(await schedule())
    res.end
  }
  catch (err) {
    console.log(err)
    res.json("internal fuction error")
    res.end
  }

})


//LISTAR NOTICIAS PARA LA PAGINA WEB
endpoints.get('/news/consult', async (req, res) => {
  try {

    // const buff = Buffer.from(req.body.message.data, 'base64');

    // const id=buff.toString('utf-8')
    // const chat= JSON.parse(id).chat_id
    await PromiseConnection();

    console.log("Connected!");

    const urlAPI = 'https://newsapi.org/v2/everything?q=crypto&language=es&sortBy=popularity&apiKey=3b67b1606d934062b206f3f9e56307fb';
    console.log(urlAPI);
    const respuestaAPI = await axios.get(urlAPI)
    const datos = await respuestaAPI.data.articles

    var notice
    let filter = [];

    if (0 < datos.length) {
      i = 0;
      while (i < 10) {
        notice = Math.floor(Math.random() * (datos.length - 0)) + 0;
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
      // filter =JSON.stringify(filter);
      // publishMessage(filter);
    }
    else
      res.json({ "mensaje": "no hay datos" })

    res.end
  }
  catch (err) {
    console.log(err)
    res.json("error")
    res.end
  }
})

endpoints.post('/news/accounts/event', async (req, res) => {
  try {

    const buff = Buffer.from(req.body.message.data, 'base64');
    const id = JSON.parse(buff.toString('utf-8'))
    console.log(id, "este es el body")
    await PromiseConnection();

    //const buff = Buffer.from(req.body.message.data, 'base64');
    //const buff = Buffer.from(req.body.message.data, 'base64');

    //const id=buff.toString('utf-8')

    try {
      var operation_type = id.operation_type
      console.log(operation_type);
    }
    catch (err) {
      res.json("invalid operation")
      res.end
    }
    console.log("Connected!");
    var telegram_user_id = id.telegram_user_id
    switch (operation_type) {

      case ("create"):
        // var first_name=id.first_name
        // var last_name=id.last_name
        // var email=id.email
        // var username=id.username
        //     var sql = "INSERT INTO user (telegram_id,first_name, last_name,email  username,  rol) VALUES ('"+telegram_user_id+"','"+first_name+"','"+ last_name+"','"+ email+"','"+ username+"','cliente');";
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

    res.end
  }
  catch (err) {
    console.log(err)
    await res.json("error")

    res.end
  }
})
//gcloud auth application-default login   
/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
// const topicNameOrId = 'YOUR_TOPIC_NAME_OR_ID';
// const data = JSON.stringify({foo: 'bar'});

// Imports the Google Cloud client library
const { PubSub } = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
const pubSubClient = new PubSub();
//GOOGLE_APPLICATION_CREDENTIALS = '.\cryptobot-369523'
async function publishMessage(messaging) {
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(messaging);

  try {
    const messageId = await pubSubClient
      .topic("projects/cryptobot-369523/topics/crypto-news-topic")
      .publishMessage({ data: dataBuffer });
    console.log(`Message ${messageId} published.`);
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = endpoints