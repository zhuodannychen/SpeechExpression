export default class SpokeWord {
	
	constructor(word) {
		this.word = word;
		this.isFiller = false;
		this.isFinal = false;
		this.timeStamp = -1;
		this.wordSpeed = -1;
		this.highlight = false;
	}
	
	finalize() {
		const timer = new Date();
		this.timeStamp = timer.getTime();
		this.isFinal = true;
	}
	
	update(word) {
		this.word = word;
	}
	
	setWordSpeed(newSpeed) {
		this.wordSpeed = newSpeed;
	}
	
	static setFiller(spokenWords, fillerWords, curIndex) {
		let maxI = curIndex;
		let remFillWords = [...fillerWords]; // copy fillerWords into remFillWords
		let newFillWords = [];
		let i = 0;
		let foundFill = false;
		
		for (; i <= maxI; i++) {
			let curStr = spokenWords[curIndex].word;
			
			for (let j = 0; j < remFillWords.length; ++j) {
				let splitFiller = remFillWords[j].split(' ');
				if (curStr === splitFiller[splitFiller.length - i - 1]) {
					if (splitFiller.length === i+1) {
						foundFill = true;
						break;
					}
					newFillWords.push(remFillWords[j]);
				}
			}
			
			curIndex--;
			if (foundFill || newFillWords.length === 0)
				break;
			
			remFillWords = newFillWords;
			newFillWords = [];
		}
		
		if (foundFill) {
			for (let k = 0; k <= i; ++k)
				spokenWords[maxI - k].isFiller = true;
			return true;
		}
		return false;
	}
	
	static getCommonFillWords(spokenWords, fillerWords) {
		let output = []
		for (let i = 0; i < fillerWords.length; ++i)
			output.push([fillerWords[i], 0]);
		console.log("In static method: " + spokenWords.length);
		for (let i = 0; i < spokenWords.length; ++i) {
			for (let j = 0; j < fillerWords.length; ++j) {
				let splitStr = fillerWords[j].split(' ');
				let satis = true;
				for (let k = 0; k < splitStr.length; ++k) {
					if (i + k < spokenWords.length && spokenWords[i+k].word === splitStr[k]);
					else {
						satis = false;
						break;
					}
				}
				//console.log(satis + " for " + spokenWords[i].word + " and " + fillerWords[j]);
				if (satis)
					output[j][1]++;
			}
		}
		output.sort((a, b) => (a[1] > b[1]) ? -1 : ((a[1] < b[1]) ? 1 : 0));
		return output.slice(0, 5);
	}
	
	static getCommonPhrases(spokenWords, blacklist) {
		let repSize1 = [];
		let repSizeN = [];
		let map1 = new Map();
		
		for (let i = 0; i < spokenWords.length; ++i) {
			let str = spokenWords[i].word;
			if (map1.has(str))
				map1.get(str).push(i);
			else map1.set(str, [i]);
		}
		
		for (let [str, arr] of map1) {
			if (arr.length > 1)
				repSize1.push([str, arr.length]);
		}
		
		for (let i = 2; map1.size > 0; ++i) {
			let map2 = new Map();
			
			for (let [str, arr] of map1) {
				if (arr.length <= 1)
					continue;
				for (let j = 0; j < arr.length; ++j) {
					if (arr[j] === 0)
						continue;
					let newStr = spokenWords[arr[j]-1].word + ' ' + str;
					if (map2.has(newStr))
						map2.get(newStr).push(arr[j]-1);
					else map2.set(newStr, [(arr[j]-1)]);
				}
				for (let j = 0; j < arr.length; ++j) {
					if (arr[j] === 0)
						continue;
					let newStr = spokenWords[arr[j]-1].word + ' ' + str;
					if (map2.get(newStr).length <= 1)
						map2.delete(newStr);
				}
			}
			
			for (let [str, arr] of map2) {
				repSizeN.push([str, i, arr.length, arr[0]]);
			}
			map1 = map2;
		}
		
		repSize1.sort((a, b) => (a[1] > b[1]) ? -1 : ((a[1] < b[1]) ? 1 : 0));
		repSizeN.sort((a, b) => (a[2]*(1.5**(a[1])) > b[2]*(1.5**(b[1]))) ? -1 : ((a[2]*(1.5**(a[1])) < b[2]*(1.5**(b[1]))) ? 1 : 0));
		
		let output1 = [];
		let outputN = [];
		
		const MAX_OUTPUT = 5;
		
		for (let i = 0; output1.length < MAX_OUTPUT && i < repSize1.length; ++i) {
			if (! blacklist.includes(repSize1[i][0]))
				output1.push(repSize1[i]);
		}
		
		for (let i = 0; outputN.length < MAX_OUTPUT && i < repSizeN.length; ++i) {
			let str = repSizeN[i][0];
			let satis = true;
			for (let j = 0; j < outputN.length; ++j) {
				if (outputN[j][0].includes(str) && str.length >= 0.25 * outputN[j][0].length) {
					satis = false;
					break;
				}
			}
			if (satis)
				outputN.push([repSizeN[i][0], repSizeN[i][2]]);
		}
		
		return [output1, outputN];
	}
	
	static processScript(rawScript) {
		if (rawScript == null)
			return ["", []];
		let adjScript = rawScript.toLowerCase();
		let newScript = "";
		let prevSpace = true;
		for (let i = 0; i < adjScript.length; ++i) {
			let c = adjScript[i];
			if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) {
				newScript += c;
				prevSpace = false;
			}
			else if (c == ' ' && ! prevSpace) {
				prevSpace = true;
				newScript += c;
			}
		}
		return [newScript, newScript.split(" ")];
	}
	
	static highlightSimilar(wordList, processedScript, blind) {
		console.log(processedScript);
		let dp = [];
		for (let i = 0; i < processedScript.length; ++i) {
			dp.push([]);
			for (let j = 0; j < wordList.length; ++j) {
				let data = [-1, -1, 0, false]; // data: previ, prevj, max
				
				if (processedScript[i] == wordList[j].word) {
					data[0] = i-1;
					data[1] = j-1;
					if (i > 0 && j > 0)
						data[2] = dp[i-1][j-1][2] + 1;
					else
						data[2] = 1;
					data[3] = true;
				}
				if (i > 0 && dp[i-1][j][2] > data[2]) {
					data[0] = dp[i-1][j][0];
					data[1] = dp[i-1][j][1];
					data[2] = dp[i-1][j][2];
					data[3] = dp[i-1][j][3];
					if (data[3]) {
						data[3] = false;
						data[0] = i-1;
						data[1] = j;
					}
				}
				if (j > 0 && dp[i][j-1][2] > data[2]) {
					data[0] = dp[i][j-1][0];
					data[1] = dp[i][j-1][1];
					data[2] = dp[i][j-1][2];
					data[3] = dp[i][j-1][3];
					if (data[3]) {
						data[3] = false;
						data[0] = i;
						data[1] = j-1;
					}
				}
				
				dp[i].push(data);
			}
		}
		
		let curi = processedScript.length-1;
		let curj = wordList.length-1;
		
		console.log(dp);
		
		let cnt = 1000;
		
		while (curi != -1 && curj != -1) {
			console.log(curi + " " + curj);
			if (dp[curi][curj][3]) {
				wordList[curj].highlight = true;
				processedScript[curi] = blind ? (<span style={{"fontWeight": "bold"}}>{processedScript[curi]}</span>) : (<span style={{"fontWeight": "bold", color: "#bda208"}}>{processedScript[curi]}</span>);
			}
			let temp = dp[curi][curj];
			curi = temp[0];
			curj = temp[1];
			if (--cnt < 0)
				break;
		}
		
		return processedScript.map(w => <span>{w} </span>);
	}
	
	getWord(version, blind) {
		if (version == 0) {
			if (this.isFiller)
				return blind ? (<span style={{"fontWeight": "bold"}}>{this.word}</span>) : (<span style={{"fontWeight": "bold", color: '#c90a0a'}}>{this.word}</span>);
			else return this.word;
		}
		else if (version == 1) {
			if (blind) {
				if (this.wordSpeed != -1 && (this.wordSpeed < 100 || this.wordSpeed > 190))
					return (<span style={{"fontWeight": "bold"}}>{this.word}</span>);
				else return this.word;
			}
			if (this.wordSpeed == -1)
				return <span style={{color: "black"}}>{this.word}</span>;
			else if (this.wordSpeed < 100)
				return <span style={{"fontWeight": "bold", color: '#0d8994'}}>{this.word}</span>;
			else if (this.wordSpeed > 190)
				return <span style={{"fontWeight": "bold", color: '#ccc904'}}>{this.word}</span>;
			else
				return <span style={{color: '#2e910d'}}>{this.word}</span>;
		}
		else if (version == 2) {
			if (this.highlight)
				return blind ? (<span style={{"fontWeight": "bold"}}>{this.word}</span>) : (<span style={{"fontWeight": "bold", color: '#bda208'}}>{this.word}</span>);
			else return this.word;
		}
		else
			return this.word;
	}
	
	getIsFinal() {
		return this.isFinal;
	}
	
	getIsFiller() {
		return this.isFiller;
	}
	
	getSpeed() {
		return this.wordSpeed;
	}
	
}