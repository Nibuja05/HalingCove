
function show(con, channel, user) {

	printMessage(channel, "Inventory from " + user.username + ": \n\t**EMTPY**");

}

function printMessage(channel, text) {
    channel.send(text)
  	.then(message => console.log(`Sent message: ${message.content}`))
  	.catch(console.error);
}

module.exports.show = show;