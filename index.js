const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require("fs");
let players = require('./players.json');

const token = '';

const PREFIX = '!';

// random sayı vermesi için fonksiyon
function randomNumber() {
    return Math.random();
}

// verilen şey sayı mı değil mi diye kontrol ediyor
function isNumeric(num) {
    return !isNaN(num)
}

bot.on('ready', () => {
    bot.user.setStatus('available')
    console.log('Ready!');
})


bot.on('message', message => {

    if(message.author.bot)
    {
        return;
    }

    // Kabrockie dışındaki serverlarda çalışmasın
    if(message.guild.id !== '588434226488279052')
    {
        return;
    }

    // Create user account once the user sends a message for the first time since the bot is active 
    // Each player begins with 100 points
    // inDuel variable is stored so that 
    if(!players[message.author.id])
    {
        players[message.author.id] = {
            points: 100,
            username: message.author.username,
            inDuel: false,
            dueling: null,
            dueledBy: null,
            wins: 0,
            loses: 0,
            winnings: 0,
            bet: 0
        }

        fs.writeFile("./players.json", JSON.stringify(players, null, 4), function(err) {
            if(err) {
              console.log(err);
            }
        });

    }

    // Users gain points by sending messages to the server. Each message earns them 5 point.
    players[message.author.id].points += 5;

    // With each message, the username gets updated (used for leaderboard)
    if(players[message.author.id].username !== message.author.username)
    {
        players[message.author.id].username = message.author.username;
    }

    fs.writeFile("./players.json", JSON.stringify(players, null, 4), function(err) {
        if(err) {
          console.log(err);
        }
    });

    // Belirli bi kanal hariç çalışmasın
    if(message.channel.id !== '632601438639620096')
    {
        return;
    }


    if(!message.content.startsWith(PREFIX))
    {
        return;
    }
    let args = message.content.substring(PREFIX.length).split(" ");

    if(args[0] === "yardım")
    {
        const embed = new Discord.RichEmbed()
            .setTitle("Düello botu komutları")
            .addField("!hesap", "Hesabınız ile ilgili istatistikleri gösterir.")
            .addField("!incele @kişi", "Seçtiğiniz kullanıcının istatistiklerini gösterir.")
            .addField("!duel @kişi <sayı>", "Eğer yeterli puanınız varsa mentionladığınız kişiyle düello başlatır.")
            .addField("!iptal", "Başlattığınız düelloyu iptal eder.")
            .addField("!give @kişi <sayı>", "Seçtiğiniz kullanıcıya puan gönderir.")
            .addField("Diğer", "Hata bildirimi ve diğer sorularınız için schweppestr#3352 kullanıcısına ulaşabilirsiniz.")
            .setColor(0x32a852)

        message.channel.send(embed);
    }


    // Check points
    if(args[0] === "hesap")
    {

        const playerData = players[message.author.id];
        var wl;

        if (playerData.loses === 0) {
            wl = 100;
        }
        else {
            wl = Math.floor(playerData.wins / (playerData.wins + playerData.loses) * 100);
        }

        const embed = new Discord.RichEmbed()
            .setTitle(playerData.username + " istatistikleri")
            .addField("Puan ", playerData.points)
            .addField("Kazanma oranı ", playerData.wins + "/" + playerData.loses + " (%" + wl + ")")
            .addField("Düellodan kazanılan puan", playerData.winnings)
            .setColor(0xb30c00)

        message.channel.send(embed);
    }


    // Check points of another player
    if(args[0] === "incele")
    {
        if(!args[1])
        {
            return;
        }

        if(!message.mentions)
        {
            message.reply(" lütfen geçerli birini mentionlayın.")
        }

        if(!message.mentions.users.first())
        {
            return;
        }

        else if(!players[message.mentions.users.first().id])
        {
            message.reply(" kullanıcının hesabı yok.")
        }

        else
        {
            const playerData = players[message.mentions.users.first().id];
            var wl;

            if (playerData.loses === 0) {
                wl = 100;
            }
            else {
                wl = Math.floor(playerData.wins / (playerData.wins + playerData.loses) * 100);
            }

            const embed = new Discord.RichEmbed()
                .setTitle(playerData.username + " istatistikleri")
                .addField("Puan ", playerData.points)
                .addField("Kazanma oranı ", playerData.wins + "/" + playerData.loses + " (%" + wl + ")")
                .addField("Düellodan kazanılan puan", playerData.winnings)
                .setColor(0xb30c00)

            message.channel.send(embed);
        }
    }

    // Duel command
    if (args[0] === "duel") {
        if (!args[1]) {
            return;
        }

        if(!args[2])
        {
            return;
        }

        if (!isNumeric(args[2])) {
            message.reply(" lütfen geçerli bir sayı girin.");
            return;
        }

        if(parseInt(args[2]) < 0)
        {
            message.reply(" lütfen 0 veya daha büyük bir sayı girin.")
            return;
        }

        if(args[2] === '' || args[2] === ' ')
        {
            return;
        }

        if(!message.mentions)
        {
            return;
        }

        if(!message.mentions.users.first())
        {
            return;
        }

        if(message.mentions.users.first().id === message.author.id)
        {
            return;
        }

        if (!players[message.mentions.users.first().id]) {
            message.reply(" rakibiniz bulunamadı.");
            return;
        }

        

        if (players[message.author.id].points < parseInt(args[2])) {
            message.reply(" o kadar puanınız bulunmamakta.");
            return;
        }

        if (players[message.mentions.users.first().id].points < parseInt(args[2])) {
            message.reply(" rakibinizin o kadar puanı bulunmamakta.");
            return;
        }

        if(players[message.author.id].inDuel === true)
        {
            message.reply(" başka biriyle düelloya başlamadan önce aktif olan düellonuzun bitmesi gerekmekte.");
            return;
        }

        if(players[message.mentions.users.first().id].inDuel === true)
        {
            message.reply(" rakibiniz şu an zaten bir düelloda.");
            return;
        }

        const playerBet = parseInt(args[2]);
        const playerData = players[message.author.id];
        const opponentData = players[message.mentions.users.first().id];

        playerData.inDuel = true;
        playerData.dueling = message.mentions.users.first().id;
        playerData.bet = playerBet;
        playerData.points -= playerBet;
        opponentData.inDuel = true;
        opponentData.dueledBy = message.author.id;

        message.channel.send("<@" + message.mentions.users.first().id + ">, <@" + message.author.id + "> tarafından " + playerBet +
            " puanlık düelloya davet edildiniz. (!kabul veya !red)");

        fs.writeFile("./players.json", JSON.stringify(players, null, 4), function (err) {
            if (err) {
                console.log(err);
            }
        });
        return;

    }

    // Accept the duel
    if (args[0] === "kabul") {
        if (players[message.author.id].dueledBy === null) {
            return;
        }

        var outcome = Math.floor(Math.random() * 2) + 1;
        const duelerdata = players[message.author.id].dueledBy;
        const dueleddata = players[message.author.id];

        if(outcome === 2)
        {
            message.channel.send("Düelloyu <@" + message.author.id + "> kazandı!");

            dueleddata.wins += 1;
            dueleddata.winnings += players[duelerdata].bet;
            dueleddata.points += players[duelerdata].bet;
            dueleddata.inDuel = false;
            dueleddata.dueledBy = null;
            
            players[duelerdata].bet = 0;
            players[duelerdata].inDuel = false;
            players[duelerdata].dueling = null;
            players[duelerdata].loses += 1;
        }
        else
        {
            message.channel.send("Düelloyu <@" + duelerdata + "> kazandı!");

            dueleddata.loses += 1;
            dueleddata.inDuel = false;
            dueleddata.dueledBy = null;
            dueleddata.points -= players[duelerdata].bet;

            players[duelerdata].points += players[duelerdata].bet * 2;
            players[duelerdata].inDuel = false;
            players[duelerdata].dueling = null;
            players[duelerdata].winnings += players[duelerdata].bet;
            players[duelerdata].wins += 1;
            players[duelerdata].bet = 0;

        }

        fs.writeFile("./players.json", JSON.stringify(players, null, 4), function(err) {
            if(err) {
              console.log(err);
            }
        });

        return;

    }

    // Refuse the duel
    if (args[0] === "red") {
        if (players[message.author.id].dueledBy === null) {
            return;
        }

        message.channel.send("<@" + players[message.author.id].dueledBy + ">, <@" + message.author.id + "> düello teklifinizi reddetti.");

        opponentid = players[message.author.id].dueledBy;

        players[opponentid].dueling = null;
        players[opponentid].inDuel = false;
        players[opponentid].points += players[opponentid].bet;
        players[opponentid].bet = 0;
        players[message.author.id].dueledBy = null;
        players[message.author.id].inDuel = false;

        fs.writeFile("./players.json", JSON.stringify(players, null, 4), function (err) {
            if (err) {
                console.log(err);
            }
        });
        return;
    }

    if(args[0] === "iptal")
    {
        if(players[message.author.id].dueling === null)
        {
            return;
        }

        const dueleddata = players[message.author.id].dueling;
        players[dueleddata].inDuel = false;
        players[dueleddata].dueledBy = null;

        players[message.author.id].dueling = null;
        players[message.author.id].inDuel = false;
        players[message.author.id].points += players[message.author.id].bet;
        players[message.author.id].bet = 0;

        message.reply(" düello iptal edildi.")

        fs.writeFile("./players.json", JSON.stringify(players, null, 4), function (err) {
            if (err) {
                console.log(err);
            }
        });
        return;
    }

    if(args[0] === "give")
    {
        if (!args[1]) {
            return;
        }

        if (!isNumeric(args[2])) {
            message.reply(" lütfen geçerli bir sayı girin.");
            return;
        }

        if(parseInt(args[2]) < 0)
        {
            message.reply(" lütfen 0 veya daha büyük bir sayı girin.")
            return;
        }

        if (!players[message.mentions.users.first().id]) {
            message.reply(" kullanıcı bulunamadı.");
            return;
        }

        if(args[2] === '' || args[2] === ' ')
        {
            return;
        }

        if (players[message.author.id].points < parseInt(args[2])) {
            message.reply(" o kadar puanınız bulunmamakta.");
            return;
        }

        players[message.mentions.users.first().id].points += parseInt(args[2]);
        players[message.author.id].points -= parseInt(args[2]);

        message.channel.send("<@" + message.mentions.users.first().id + ">, hesabınıza <@" + message.author.id + "> tarafından " + args[2] + " puan aktarıldı.");
    }


    if(args[0] === "adminpower")
    {
        if(message.author.id !== '298884333970784256')
        {
            return;
        }

        players[message.mentions.users.first().id].points += parseInt(args[2]);
    }


    // Save data
    fs.writeFile("./players.json", JSON.stringify(players, null, 4), function(err) {
        if(err) {
          console.log(err);
        }
    });

})




bot.login(token);
