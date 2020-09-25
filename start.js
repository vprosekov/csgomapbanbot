const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const { reply, fork } = Telegraf

const bot = new Telegraf("YOUR-TELEGRAM-TOKEN")

var fs = require("fs");

var cc = fs.readFileSync("users.json");
var users = JSON.parse(cc);



getObjects = (obj, key, val) => {
    let objects = [];
    for (const i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));    
        } else 
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
}

console.log('> Бот запущен.');

function length(obj) {
    return Object.keys(obj).length;
}

async function checkUser(msg, userId)
{
    
}

//console.log(getObjects(users.rooms["ojb3zl"], "team", 2))

async function saveUsers()
{
	fs.writeFile('users.json', JSON.stringify(users, null, '\t'), function(err) {
		if(err) throw err;
	});
	return true;
}

setInterval(async () => {
    await saveUsers();
	console.log('saved');
}, 3000);

function empKb(){
    var options = {
        reply_markup: JSON.stringify({
          inline_keyboard: [],
          parse_mode: 'Markdown'
        })
      };
    return options;
}

function keybrd(teamId) {
    let roomId = teamId.toString().substring(0, 6);
    if(users.rooms[roomId]&&users.rooms[roomId].order==users.rooms[roomId][teamId].team){
        let kb = [];
        if(users.rooms[roomId].status[0]==true){kb.push([{ text: 'Inferno', callback_data: `Inferno_${teamId}` }])};
        if(users.rooms[roomId].status[1]==true){kb.push([{ text: 'Nuke', callback_data: `Nuke_${teamId}` }])};
        if(users.rooms[roomId].status[2]==true){kb.push([{ text: 'Mirage', callback_data: `Mirage_${teamId}` }])};
        if(users.rooms[roomId].status[3]==true){kb.push([{ text: 'Train', callback_data: `Train_${teamId}` }])};
        if(users.rooms[roomId].status[4]==true){kb.push([{ text: 'Dust 2', callback_data: `Dust 2_${teamId}` }])};
        if(users.rooms[roomId].status[5]==true){kb.push([{ text: 'Overpass', callback_data: `Overpass_${teamId}` }])};
        if(users.rooms[roomId].status[6]==true){kb.push([{ text: 'Vertigo', callback_data: `Vertigo_${teamId}` }])};
        var options = {
            reply_markup: JSON.stringify({
              inline_keyboard: kb,
              parse_mode: 'Markdown'
            })
          };
          //console.log(options);
        return options;
    }
    else {
        var options = {
            reply_markup: JSON.stringify({
              inline_keyboard: [[
                { text: '🚫 Выбирает противник', callback_data: 'none' }
            ]],
              parse_mode: 'Markdown'
            })
          };
          return options;
    }

}
//console.log(keybrd('ojb3zlk7g'));
bot.command('start', (msg) => {
    const aboutMenu = Telegraf.Extra
  .markdown()
  .markup((m) => m.keyboard([
    m.callbackButton('⬅️ Back')
  ]).resize())
    console.log(msg.message);
    return msg.reply(`Чтобы создать новую комнату введи /createnew
Чтобы присоединиться к уже созданной напиши /connect [код]`);
});

bot.command('createnew', (msg) => {
    //console.log(msg.message);
    
    let roomId = Math.random().toString(36).substring(2,8);
    console.log(roomId);

    let team1code = roomId + Math.random().toString(36).substring(10);
    let team2code = roomId + Math.random().toString(36).substring(10);

    users.rooms[roomId] = JSON.parse(`{
        "codes":["${team1code}", "${team2code}"],
        "order": 2,
        "mapcount": 7,
		"status": [true, true, true, true, true, true, true],
		"${team1code}":{
            "team": 1,
            "id": 0
		},
		"${team2code}":{
			"team": 2,
            "id": 0
		}
	}`.toString());
    return msg.reply(`Ваша комната создана
Kод для команды 1: ${team1code}
Kод для команды 2: ${team2code}
Для подключения напишите /connect [код]`);
});

bot.hears(/connect (.+)/, (msg) => {

    let id = msg.message.text.toString().split(" ")[1];
    let roomId = id.substring(0, 6);
    let teamcode = id;
    console.log(id)
    console.log(roomId);
    if(users.rooms.hasOwnProperty(roomId) && users.rooms[roomId].hasOwnProperty(teamcode)) {
        if(users.rooms[roomId][teamcode].id == 0){
            users.rooms[roomId][teamcode].id = msg.message.chat.id;
            if(users.rooms[roomId][teamcode].team == 1){
                console.log(getObjects(users.rooms[roomId], "team", 2)[0].id);
                if(getObjects(users.rooms[roomId], "team", 2)[0].id==0){
                    msg.reply("Ожидаем противоположную команду..");
                }
                else{
                    msg.reply(`Карту первым выбирает противник...`);
                    msg.telegram.sendMessage(getObjects(users.rooms[roomId], "team", 2)[0].id, `Команда 1 подключилась.
1. Inferno: ${users.rooms[roomId].status[0]==true?"✅":"❌"}
2. Nuke: ${users.rooms[roomId].status[1]==true?"✅":"❌"}
3. Mirage: ${users.rooms[roomId].status[2]==true?"✅":"❌"}
4. Train: ${users.rooms[roomId].status[3]==true?"✅":"❌"}
5. Dust 2: ${users.rooms[roomId].status[4]==true?"✅":"❌"}
6. Overpass: ${users.rooms[roomId].status[5]==true?"✅":"❌"}
7. Vertigo: ${users.rooms[roomId].status[6]==true?"✅":"❌"}

Для выбора карты напишите нажмите на кнопку ниже`, keybrd(users.rooms[roomId].codes[1]));
                }
            }
            else if(users.rooms[roomId][teamcode].team == 2){
                if(getObjects(users.rooms[roomId], "team", 1)[0].id==0){
                    msg.reply("Ожидаем противоположную команду..");
                }
                else{
                    msg.reply(`
1. Inferno: ${users.rooms[roomId].status[0]==true?"✅":"❌"}
2. Nuke: ${users.rooms[roomId].status[1]==true?"✅":"❌"}
3. Mirage: ${users.rooms[roomId].status[2]==true?"✅":"❌"}
4. Train: ${users.rooms[roomId].status[3]==true?"✅":"❌"}
5. Dust 2: ${users.rooms[roomId].status[4]==true?"✅":"❌"}
6. Overpass: ${users.rooms[roomId].status[5]==true?"✅":"❌"}
7. Vertigo: ${users.rooms[roomId].status[6]==true?"✅":"❌"}

Для выбора карты нажмите на кнопку ниже`, keybrd(teamcode));
                    msg.telegram.sendMessage(getObjects(users.rooms[roomId], "team", 1)[0].id, `Команда 2 подключилась.
Карту выбирает противник...`);
                }
            }
            
            //когда противник зашел
            //msg.reply(`Карту выбирает противник..`);
            //хз что
        }
        else {
            msg.reply(`Этот код уже активировал @${users.rooms[roomId][teamcode].id}
        
Чтобы создать новую комнату введи /createnew
Чтобы присоединиться к уже созданной напиши /connect [код]`);
        }
    }
    else {
        msg.reply(`ВВЕДИТЕ ПРАВИЛЬНЫЙ КОД
        
Чтобы создать новую комнату введи /createnew
Чтобы присоединиться к уже созданной напиши /connect [код]`);
    }
  })

//ЗАВЕРШИТЬ ВЫБОР КАРТ(РЕДАКТИРОВАНИЕ ОТВЕЧЕННОГО СООБЩЕНИЯ, ОБНОВЛЕНИЕ СООБЩЕНИЯ ПРОТИВНИКУ)
bot.on('callback_query', function (msg) {
    console.log(msg.update.callback_query.message.reply_markup.inline_keyboard);
    if(msg.update.callback_query.data==undefined || !msg.update.callback_query.data.includes("_")) return;
    let answer = msg.update.callback_query.data.split('_');
    let map = answer[0];
    let teamcode = answer[1];
    let roomId = teamcode.substring(0, 6);
    if(users.rooms[roomId][teamcode].msgid==undefined){
        users.rooms[roomId][teamcode].msgid=msg.update.callback_query.message.message_id;
    }
    //msg.editMessageText('SAKDosfdsf, ', keybrd(teamcode))

    if(users.rooms[roomId].order==users.rooms[roomId][teamcode].team){
        switch(map) {
            case "Inferno":
                if(users.rooms[roomId].status[0]==false){
                    msg.reply("Эта карта уже убрана из списка, выберите другую.");
                }
                else{
                    users.rooms[roomId].status[0]=false;
                    users.rooms[roomId].mapcount--;
                    if(users.rooms[roomId][teamcode].team==1){
                        users.rooms[roomId].order=2;
                    }
                    else{
                        users.rooms[roomId].order=1;
                    }
                }
            break;


            case "Nuke":
                if(users.rooms[roomId].status[1]==false){
                    msg.reply("Эта карта уже убрана из списка, выберите другую.");
                }
                else{
                    users.rooms[roomId].status[1]=false;
                    users.rooms[roomId].mapcount--;
                    if(users.rooms[roomId][teamcode].team==1){
                        users.rooms[roomId].order=2;
                    }
                    else{
                        users.rooms[roomId].order=1;
                    }
                }
            break;


            case "Mirage":
                if(users.rooms[roomId].status[2]==false){
                    msg.reply("Эта карта уже убрана из списка, выберите другую.");
                }
                else{
                    users.rooms[roomId].status[2]=false;
                    users.rooms[roomId].mapcount--;
                    if(users.rooms[roomId][teamcode].team==1){
                        users.rooms[roomId].order=2;
                    }
                    else{
                        users.rooms[roomId].order=1;
                    }
                }
            break;


            case "Train":
                if(users.rooms[roomId].status[3]==false){
                    msg.reply("Эта карта уже убрана из списка, выберите другую.");
                }
                else{
                    users.rooms[roomId].status[3]=false;
                    users.rooms[roomId].mapcount--;
                    if(users.rooms[roomId][teamcode].team==1){
                        users.rooms[roomId].order=2;
                    }
                    else{
                        users.rooms[roomId].order=1;
                    }
                }
            break;


            case "Dust 2":
                if(users.rooms[roomId].status[4]==false){
                    msg.reply("Эта карта уже убрана из списка, выберите другую.");
                }
                else{
                    users.rooms[roomId].status[4]=false;
                    users.rooms[roomId].mapcount--;
                    if(users.rooms[roomId][teamcode].team==1){
                        users.rooms[roomId].order=2;
                    }
                    else{
                        users.rooms[roomId].order=1;
                    }
                }
            break;


            case "Overpass":
                if(users.rooms[roomId].status[5]==false){
                    msg.reply("Эта карта уже убрана из списка, выберите другую.");
                }
                else{
                    users.rooms[roomId].status[5]=false;
                    users.rooms[roomId].mapcount--;
                    if(users.rooms[roomId][teamcode].team==1){
                        users.rooms[roomId].order=2;
                    }
                    else{
                        users.rooms[roomId].order=1;
                    }
                }
            break;


            case "Vertigo":
                if(users.rooms[roomId].status[6]==false){
                    msg.reply("Эта карта уже убрана из списка, выберите другую.");
                }
                else{
                    users.rooms[roomId].status[6]=false;
                    users.rooms[roomId].mapcount--;
                    if(users.rooms[roomId][teamcode].team==1){
                        users.rooms[roomId].order=2;
                    }
                    else{
                        users.rooms[roomId].order=1;
                    }
                }
            break;
        }
        saveUsers();
        if(users.rooms[roomId].mapcount<=1){
            let winmap="";
            for (let i in users.rooms[roomId].status){
                if(users.rooms[roomId].status[i]==false){continue;}
                if(i==0)winmap="Inferno";
                if(i==1)winmap="Nuke";
                if(i==2)winmap="Mirage";
                if(i==3)winmap="Train";
                if(i==4)winmap="Dust 2";
                if(i==5)winmap="Overpass";
                if(i==6)winmap="Vertigo";
                break;  
            }

            msg.editMessageText(`🤪Осталась карта ${winmap} 🤪`, empKb());

            msg.telegram.editMessageText(getObjects(users.rooms[roomId], "team", (users.rooms[roomId][teamcode].team==1?2:1))[0].id,getObjects(users.rooms[roomId], "team", (users.rooms[roomId][teamcode].team==1?2:1))[0].msgid, 0,`🤪Осталась карта ${winmap} 🤪`, empKb);

            delete users.rooms[roomId];
            return;

        }
        msg.editMessageText(`1. Inferno: ${users.rooms[roomId].status[0]==true?"✅":"❌"}
2. Nuke: ${users.rooms[roomId].status[1]==true?"✅":"❌"}
3. Mirage: ${users.rooms[roomId].status[2]==true?"✅":"❌"}
4. Train: ${users.rooms[roomId].status[3]==true?"✅":"❌"}
5. Dust 2: ${users.rooms[roomId].status[4]==true?"✅":"❌"}
6. Overpass: ${users.rooms[roomId].status[5]==true?"✅":"❌"}
7. Vertigo: ${users.rooms[roomId].status[6]==true?"✅":"❌"}

Для выбора карты нажмите на кнопку ниже`, keybrd(teamcode));
        if(users.rooms[roomId][users.rooms[roomId].codes[(users.rooms[roomId][teamcode].team==1?1:0)]].msgid==undefined){
            msg.telegram.sendMessage(getObjects(users.rooms[roomId], "team", (users.rooms[roomId][teamcode].team==1?2:1))[0].id, `Противник удалил ${map}. Ваша очередь...
1. Inferno: ${users.rooms[roomId].status[0]==true?"✅":"❌"}
2. Nuke: ${users.rooms[roomId].status[1]==true?"✅":"❌"}
3. Mirage: ${users.rooms[roomId].status[2]==true?"✅":"❌"}
4. Train: ${users.rooms[roomId].status[3]==true?"✅":"❌"}
5. Dust 2: ${users.rooms[roomId].status[4]==true?"✅":"❌"}
6. Overpass: ${users.rooms[roomId].status[5]==true?"✅":"❌"}
7. Vertigo: ${users.rooms[roomId].status[6]==true?"✅":"❌"}

Для выбора карты нажмите на кнопку ниже`, keybrd(users.rooms[roomId].codes[(users.rooms[roomId][teamcode].team==1?1:0)]));
        }
        else{
            msg.telegram.editMessageText(getObjects(users.rooms[roomId], "team", (users.rooms[roomId][teamcode].team==1?2:1))[0].id,getObjects(users.rooms[roomId], "team", (users.rooms[roomId][teamcode].team==1?2:1))[0].msgid, 0,`Противник удалил ${map}. Ваша очередь...
1. Inferno: ${users.rooms[roomId].status[0]==true?"✅":"❌"}
2. Nuke: ${users.rooms[roomId].status[1]==true?"✅":"❌"}
3. Mirage: ${users.rooms[roomId].status[2]==true?"✅":"❌"}
4. Train: ${users.rooms[roomId].status[3]==true?"✅":"❌"}
5. Dust 2: ${users.rooms[roomId].status[4]==true?"✅":"❌"}
6. Overpass: ${users.rooms[roomId].status[5]==true?"✅":"❌"}
7. Vertigo: ${users.rooms[roomId].status[6]==true?"✅":"❌"}

Для выбора карты нажмите на кнопку ниже`, keybrd(users.rooms[roomId].codes[(users.rooms[roomId][teamcode].team==1?1:0)]));
        }
    }
    else{
        msg.reply(`Ждите пока противоположная команда выберет карту.`);
    }

    //bot.answerCallbackQuery(msg.id, 'Вы выбрали: '+ msg.data, true);
});

// Text messages handling
bot.hears('Hey', (msg) => {
  msg.session.heyCounter = msg.session.heyCounter || 0
  msg.session.heyCounter++
  return msg.replyWithMarkdown(`_Hey counter:_ ${msg.session.heyCounter}`)
})


bot.command('answer', (msg) => {
  console.log(msg.message)
  return msg.reply('*42*', Extra.markdown())
})

// Launch bot
bot.launch()