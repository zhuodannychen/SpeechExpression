import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReactHowler from 'react-howler'
import '../App.css'
import '../timer.js'
import wcLogo from './woodchuckLogo.png';
import DuDuDu from './dududu.mp3'

// https://conversationstartersworld.com/250-conversation-starters/
const impromptuQuestions = [
                "What was the last funny video you saw?",
                "What do you do to get rid of stress?",
                "What is something you are obsessed with?",
                "What three words best describe you?",
                "What would be your perfect weekend?",
                "What's your favorite number? Why?",
                "What are you going to do this weekend?",
                "What's the most useful thing you own?",
                "What's your favorite way to waste time?",
                "Do you have any pets? What are their names?",
                "Where did you go last weekend? / What did you do last weekend?",
                "What is something popular now that annoys you?",
                "What did you do on your last vacation?",
                "When was the last time you worked incredibly hard?",
                "Are you very active, or do you prefer to just relax in your free time?",
                "What do you do when you hang out with your friends?",
                "What's the best / worst thing about your work/school?",
                "What were you really into when you were a kid?",
                "If you could have any animal as a pet, what animal would you choose?",
                "If you opened a business, what kind of business would it be?",
                "Are you a very organized person?",
                "What is the strangest dream you have ever had?",
                "Who had the biggest impact on the person you have become?"
            ]
    
// https://hrinterviews.blogspot.com/
const interviewQuestions = [
                "Tell me about yourself.",
                "What are your greatest strengths?",
                "What are your greatest weaknesses?",
                "Tell me about something you did - or failed to do - that you now feel a little ashamed of.",
                "Why are you leaving (or did you leave) this position?",
                "Why should I hire you?",
                "Aren't you overqualified for this position?",
                "Where do you see yourself five years from now?",
                "Describe your ideal company, location and job.",
                "Why do you want to work at our company?",
                "What are your career options right now?",
                "Tell me honestly about the strong points and weak points of your boss (company, management team, etc.)…",
                "What good books have you read lately?",
                "Tell me about a situation when your work was criticized.",
                "What are your outside interest?",
                "Looking back, what would you do differently in your life?",
                "Could you have done better in your last job?",
                "What was the toughest decision you ever had to make?"
    ]

function Home(props) {
    const [timeVis, setTimeVis] = useState(true);
    const [scriptVis, setScriptVis] = useState(true);
    const [translatedVis, setTranslatedVis] = useState(true);
    const [playing, setPlaying] = useState(false)
	const [colorblinMod, setColorblinMod] = useState(false);
	const [boomMode, setBoomMode] = useState(false);
    const [topic, setTopic] = useState(1)
    const [question, setQuestion] = useState("")


    // const ConditionalLink = ({ children, to, condition }) => (!!condition && to)
    //   ? <Link to={to}>{children}</Link>
    //   : <>{children}</>;

    const handleOnClickRecord = isListening => {
        props.handleOnClickRecord(isListening)
    }

    const handleScriptChange = (event) => {
        props.handleScriptChange(event.target.value)
    }

    const handleFillerWordsChange = (event) => {
        props.handleFillerWordsChange(event.target.value)
    }
    
    const swapTheme = theme => {
        props.swapTheme(theme)
    }

    const handleTimeVis = (event) => {
        setTimeVis(event.target.checked)
    }

    const handleScriptVis = (event) => {
        setScriptVis(event.target.checked)
    }

    const handleTranslatedVis = (event) => {
        setTranslatedVis(event.target.checked)
    }

    const handlePlay = (event) => {
        setPlaying(event.target.checked)
    }
	
	const handleColorblindChange = (event) => {
		setColorblinMod(event.target.checked)
		props.handleColorblindModeChange(event.target.checked)
	}
	
	const handleBoomModeChange = (event) => {
		setBoomMode(event.target.checked)
		props.handleBoomModeChange(event.target.checked)
	}

    const handleTopic = (pos) => {
        const newTopicSet = topic ^ (1 << pos)
        setTopic(newTopicSet);
        console.log(topic);
    }

    const handleQuestion = () => {
        let selectedQuestions = [];
        if (topic & (1 << 0)) {
            selectedQuestions.push(...impromptuQuestions);
        }
        if (topic & (1 << 1))
            selectedQuestions.push(...interviewQuestions);
        console.log(selectedQuestions)
        const rand = Math.floor(Math.random() * selectedQuestions.length)
        setQuestion(selectedQuestions[rand])
    }

    return (
        <div className="container-fluid">
            <div className="navbar">
                <tr>
                    <td className='thin'><img className="App-logo" src={wcLogo} alt="Woodchuck Logo"></img></td>
                    <td><h1>Team 7 Speech Expression: Home</h1></td>
                    <td>
                        {/* <ConditionalLink to="/summary" condition={props.isListening}>
                        </ConditionalLink> */}
                        <button onClick={() => handleOnClickRecord(prevState => !prevState)}>{props.isListening ? "Stop Mic" : "Start Mic"}</button>
                        <Link to="/summary" style={{textDecoration: "none", color: "black"}}><button disabled={props.isListening || props.speech == null}>Summary</button></Link>
                    </td>
                </tr>
            </div>
            <h3 style={{color: timeVis ? "#444444" : "white"}}>{props.time}</h3>
            <div className="row">
                <div className='col tip'>
                    <h2>Script</h2>
                    <span className='tip-content'>Enter in this box any text you want to compare your speech to.</span>
                </div>
                <div className='col tip'>
                    <h2>Transcribed Speech</h2>
                    <span className='tip-content'>Your speech will be transcribed here.</span>
                </div>
                <div className='col tip'>
                    <h2>Options</h2>
                    <span className='tip-content'>Here are some options for changing your Home tools and layout.</span>
                </div>
            </div>
            <div className="row">
                <textarea className="col box" style={{width: "100%", height: "100%", border: "none", outline: "none", filter: (scriptVis ? "none" : "blur(5px)")}} name="script" id="script" onChange={handleScriptChange}/>
                <div className="col box" style={{filter: (translatedVis ? "none" : "blur(5px)")}}>
                    <p>{props.speech}</p>
                </div>
                <div className="col box">
                    <ul style={{textAlign: "left", listStyle: "none"}}>
                        <li>
                            <input
                                type="checkbox"
                                onChange={handleTimeVis}
                                checked={timeVis}
                            />
                            &nbsp; Timer
                        </li>
                        <li>
                            <input
                                type="checkbox"
                                onChange={handleScriptVis}
                                checked={scriptVis}
                            />
                            &nbsp; Script
                        </li>
                        <li>
                            <input
                                type="checkbox"
                                onChange={handleTranslatedVis}
                                checked={translatedVis}
                            />
                            &nbsp; Translated Box
                        </li>
						<li>
                            <input
                                type="checkbox"
                                onChange={handleColorblindChange}
                                checked={colorblinMod}
                            />
                            &nbsp; Colorless Mode
                        </li>
						<li>
                            <input
                                type="checkbox"
                                onChange={handleBoomModeChange}
                                checked={boomMode}
                            />
                            &nbsp; Sound Effects on Filler Words
                        </li>
                        <li>
                            <input
                                type="checkbox"
                                onChange={handlePlay}
                                checked={playing}
                            />
                            &nbsp; Background Noise
                        </li>
                        {/* <li>
                            <input
                                type="checkbox"
                                onChange={handlePlay}
                                checked={playing}
                            />
                            &nbsp; Background Noise
                        </li> */}
                        <br />
                        <li>
                            <b>Filler Words</b>
                            <br />
                            <textarea style={{width: "100%"}} defaultValue={props.fillerWords} onChange={handleFillerWordsChange}></textarea>
                        </li>
                        <li>
                            <button className="btn-sm" style={{margin: 0}} onClick={() => swapTheme('dark')}>Dark</button>
                            <button className="btn-sm" onClick={() => swapTheme('light')}>Light</button>
                        </li>
                        <br />
                        <li>
                            <input
                                type="checkbox"
                                onChange={(pos) => handleTopic(0)}
                                checked={topic & (1 << 0)}
                            />
                            &nbsp; Impromptu Questions
                        </li>
                        <li>
                            <input
                                type="checkbox"
                                onChange={(pos) => handleTopic(1)}
                                checked={(topic & (1 << 1))}
                            />
                            &nbsp; Interview Questions
                        </li>
                        <li>
                            <button className="btn-sm" style={{margin: "0"}} onClick={handleQuestion}>Generate Topic</button>
                            <br />
                            <br />
                            {question}
                        </li>
                    </ul>
                </div>
            </div>
            <ReactHowler
                src={DuDuDu}
                playing={playing}
                loop={true}
            />
        </div>
    );
}

export default Home;
