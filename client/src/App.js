import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home'
import Summary from './components/Summary'
import SpokeWord from './structure/SpokeWord';
import BOOMLOL from './beepsound.mp3'

const { PUBLIC_URL } = process.env

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const mic = new SpeechRecognition()

mic.continuous = true // whether continuous results are returned
mic.interimResults = true
mic.lang = 'en-US'
// mic.lang = 'zh-CN'

let spokenWords = []
const defaultFillerWords = ["like", "okay", "right", "you know", "ah", "so", "basically"]

function App() {
    const [isListening, setIsListening] = useState(false)
    const [speech, setSpeech] = useState(null)
	const [colorblindMode, setColorblindMode] = useState(false)
	const [boomMode, setBoomMode] = useState(false)
    
    // timer
    const [timer, setTimer] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const countRef = useRef(null)

    // script
    const [script, setScript] = useState(null)
    // filler words
    const [fillerWords, setFillerWords] = useState(defaultFillerWords)
	
	// can change this to a set to increase efficiency, but may not be necessary
	const blacklist = ["i", "me", "you", "and", "a", "an", "but", "because", "so", "is"]
	
	const SAFETY = 2 // only analyzes a word after this many words have been spoken after it.
    // every time isListening changes state, handleListen() runs
    useEffect(() => {
        handleListen()
    }, [isListening])

    useEffect(() => {
        const color = getComputedStyle(document.documentElement).getPropertyValue('--bg');
        console.log(`--bg: ${color}`);
    }, [])

    const handleOnClickRecord = newValue => {
        setIsListening(newValue);
        // Timer works but isListening seems to be the opposite value???
        if (isListening) {
            clearInterval(countRef.current)
        } else {
            clearInterval(countRef.current)
            setIsActive(false)
            setTimer(0)

            setIsActive(true)
            // setIsPaused(true)
            countRef.current = setInterval(() => {
                setTimer((timer) => timer + 1)
            }, 1000)
        }
    }

    const handleListen = () => {
        if (isListening) {
			console.log("Resetting!");
			spokenWords = []
            mic.start()
            mic.onend = () => {
                console.log('continue')
                mic.start()
            }
        } else {
            mic.stop();
			for (let i = spokenWords.length - SAFETY - 2; i < spokenWords.length; ++i) {
				if (i < 0)
					continue;
				spokenWords[i].finalize();
				SpokeWord.setFiller(spokenWords, fillerWords, i);
			}
            mic.onend = () => {
                console.log('Stopped mic on click')
            }
			console.log("Generating the details!: " + spokenWords.length);
			// genDetailsAsString();
        }

        mic.onstart = () => {
            console.log('Mics on')
        }

        mic.onresult = event => {
            const transcript = Array.from(event.results)
				.map(result => result[0])
				.map(result => result.transcript.toLowerCase())
				.join('')
				.split(' ');
			
			// add new words to the word data array
			let numToAdd = transcript.length - spokenWords.length;
			for (let i = 0; i < numToAdd; ++i) {
				let sw = new SpokeWord(transcript[transcript.length - numToAdd + i]);
				spokenWords.push(sw);
			}
			
			// update the words previous to the one that was just added
			for (let i = 0; i < SAFETY; ++i) {
				let j = spokenWords.length - numToAdd - SAFETY + i;
				if (j < 0 || j >= transcript.length || spokenWords[j].getIsFinal())
					continue;
				spokenWords[j].update(transcript[j]);
			}
			
			// finalize words that are beyond SAFETY
			for (let i = 0; i < numToAdd; ++i) {
				let j = spokenWords.length - numToAdd - SAFETY + i;
				if (j < 0)
					continue;
				if (! spokenWords[j].getIsFinal()) {
					spokenWords[j].finalize();
					if (SpokeWord.setFiller(spokenWords, fillerWords, j) && boomMode)
						playBeep();
				}
					
			}
			
			const modSpeech = spokenWords.map(sw => <span>{sw.getWord(0, colorblindMode)} </span>)
			console.log("In update: " + spokenWords.length);
            setSpeech(modSpeech)
            mic.onerror = event => {
                console.log(event.error)
            }
        }
    }

    const formatTime = () => {
        const getSeconds = `0${(timer % 60)}`.slice(-2)
        const minutes = `${Math.floor(timer / 60)}`
        const getMinutes = `0${minutes % 60}`.slice(-2)
        const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)
    
        return `${getHours} : ${getMinutes} : ${getSeconds}`
    }

    const handleScriptChange = (newScript) => {
        setScript(newScript)
    }

    const handleFillerWordsChange = (newFillerWordList) => {
        setFillerWords(newFillerWordList.split(","));
    }
	
	const handleColorblindModeChange = (newState) => {
		setColorblindMode(newState);
		console.log("Updated ColorBlind mode to " + newState);
	}
	
	const handleBoomModeChange = (newState) => {
		setBoomMode(newState);
		console.log("Updated BoomMOde mode to " + newState);
	}

	const playBeep = () => {
		console.log("Playing Beep Sound");
		const audioFile = new Audio(BOOMLOL);
		audioFile.play();
	}
    const swapTheme = (theme) => {
        if (theme == "light") {
            document.documentElement.style.setProperty('--bg', 'white');
            document.documentElement.style.setProperty('--text', 'black');
            document.documentElement.style.setProperty('--bg-nav', 'rgb(167, 165, 165)');
            document.documentElement.style.setProperty('--text-nav', 'white');
            document.documentElement.style.setProperty('--bttn-nav', 'rgb(82, 82, 82)');
        } else {
            document.documentElement.style.setProperty('--bg', 'rgb(68,68,68)');
            document.documentElement.style.setProperty('--text', 'white');
            document.documentElement.style.setProperty('--bg-nav', 'rgb(175,175,175)');
            document.documentElement.style.setProperty('--text-nav', 'black');
            document.documentElement.style.setProperty('--bttn-nav', 'rgb(211,211,211)');
        }
    }
    
    
    return (
        <div className="App">
            <BrowserRouter basename={PUBLIC_URL}>
                <Routes>
                    <Route path="/" element={<Home
                                                speech={speech}
                                                isListening={isListening}
                                                handleOnClickRecord={handleOnClickRecord}
                                                handleScriptChange={handleScriptChange}
                                                handleFillerWordsChange={handleFillerWordsChange}
                                                fillerWords={fillerWords}
                                                time={formatTime()}
												handleColorblindModeChange={handleColorblindModeChange}
												handleBoomModeChange={handleBoomModeChange}
                                                swapTheme={swapTheme}
                                             />} />
                    <Route path="/summary" element={<Summary
                                                        spokenWords={spokenWords}
                                                        speech={speech}
                                                        time={formatTime()}
                                                        handleScriptChange={handleScriptChange}
                                                        script={script}
														colorblindMode={colorblindMode}
                                                    />}/>
                </Routes>
            </BrowserRouter>
        </div>
		
    );


}

export default App;
