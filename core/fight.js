const Discord = require ('discord.js');

function start(con, user, channel) {
	console.log("[FT] Starting...");
	
   	sendEmbed(channel, "Starting Fight...", "Fight Action happening here!", "#660000", user.id);
}

function sendEmbed(channel, title, description, color, origUser) {

	var embed = new Discord.RichEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)

    const client = new Discord.Client();

    function emoji (id) {
		return client.emojis.get(id).toString();
	}

	const emoji_A = ":regional_indicator_a:";
	const emoji_B = ":regional_indicator_b:";

    const filter = (reaction, user) => {
        return [emoji_A, emoji_B].includes(reaction.emoji.name) && user.id === origUser;
    };

    channel.send(embed)
    .then(function (message) {
        message.react(emoji_A)
        .then(() => message.react(emoji_B))
        .catch(() => console.error('One of the emojis failed to react.'))
        .then(() => message.awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] }))
        .then(collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === emoji_A) {
            	embed.setDescription(description + "\nextra Text! :O")
                console.log('<@' + origUser + '> you reacted with A.');
            } else {
            	embed.setDescription(description + "\nno extra Text! :(")
                console.log('<@' + origUser + '> you reacted with B.');
            }
        })
        .catch(collected => {
            message.channel.send('<@' + origUser + '> teeeeest!');
        })
        .then(() => message.edit(embed));
    });
}

module.exports.start = start;