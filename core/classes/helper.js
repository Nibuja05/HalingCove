
/**
 * A class to store the log entries of an ongoing battle
 */
class BattleLog{
	/**
	 * creates a new BattleLog with a maximum length, queue like behavior
	 * @param  {int} 	axLength 	maximum length of log
	 */
	constructor(maxLen) {
		this.maxLen = maxLen;
		this.cont = [];
	}
	/**
	 * returns the length of this log
	 * @return {int} 	length of this log
	 */
	getCurrentLines() {
		return this.cont.length;
	}
	/**
	 * add new text to this log, will overwrite old text
	 * @param {String} 	newText 	new multiline text to enter
	 */
	add(newText) {
		var newArr = newText.split("\n");
		for (var i = 0; i < newArr.length; i++) {
			this.cont.splice(0, 0, newArr[i]);
		}
		var lineCount = 0;
		var maxIndex = this.cont.length;
		for (var i = 0; i < this.cont.length; i++) {
			lineCount += this.measureElement(this.cont[i]);
			if (lineCount > this.maxLen) {
				maxIndex = i;
				break;
			}
		}
		this.cont.splice(maxIndex, (this.cont.length - maxIndex + 1));
	}
	measureElement(elem) {
		var n = 50; //maximum line length, limited to 50
		return elem.match(new RegExp('.{1,' + n + '}', 'g')).length;
	}
	/**
	 * return the battleLog as one string
	 * @return {String} multiline battleLog
	 */
	toString() {
		var text = "";
		var lineCount = 0;
		var fillCount = 0;
		for (var i = this.cont.length - 1; i >= 0; i--) {
			lineCount += this.measureElement(this.cont[i]);
			if (lineCount > this.maxLen) {
				break;
			} else {
				text += "- " + this.cont[i] + "\n";
			}
		}
		var count = this.maxLen - lineCount;
		for (var i = 0; i < count; i++) {
			text += "\n"
		}
		return text;
	}
}

module.exports.BattleLog = BattleLog;