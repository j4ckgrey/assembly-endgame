import { useState, useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import React from "react"
import { languages } from "./languages"
import { getFarewellText, getRandomWord } from "./utils"
import Confetti from "react-confetti"

export default function App() {
  const [currentWord, setCurrentWord] = useState(() => getRandomWord())

  const [guessedLetters, setGuessedLetters] = useState([])

  const wrongGuessCount = guessedLetters.filter(letter => !currentWord.includes(letter)).length

  const isGameWon = currentWord.split('').every(letter => guessedLetters.includes(letter))

  const isGameLost = wrongGuessCount >= (languages.length - 1)

  const isGameOver = isGameWon || isGameLost

  const alphabet = "abcdefghijklmnopqrstuvwxyz"

  const numGuessesLeft = languages.length - 1

  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]

  const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

  function addGuessedLetter(letter) {
    setGuessedLetters(prevLetters =>
        prevLetters.includes(letter) ?
            prevLetters :
            [...prevLetters, letter]
    )
  }

  const languageElements = languages.map((language, index) => {
    const styles = {
      backgroundColor: language.backgroundColor,
      color: language.color
    }
    const clsxClass = clsx("chip", {lost: index < wrongGuessCount})
    return (
      <span className={clsxClass}
      style={styles}
      key={index} >
        {language.name}
      </span>
    )
  })

  const letterElements = currentWord.split("").map((letter, index) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
    const letterClassName = clsx(
        isGameLost && !guessedLetters.includes(letter) && "missed-letter"
    )
    return (
        <span key={index} className={letterClassName}>
            {shouldRevealLetter ? letter.toUpperCase() : ""}
        </span>
    )
})

  const keyboardElements = alphabet.split('').map(letter => {
    const isGuessed = guessedLetters.includes(letter)
    const isCorrect = isGuessed && currentWord.toUpperCase().includes(letter.toUpperCase())
    const isWrong = isGuessed && !currentWord.toUpperCase().includes(letter.toUpperCase())
    const className = clsx({correct: isCorrect, wrong: isWrong})
    return (
      <button
        disabled={isGameOver}
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={`letter ${letter}`}
        className={className}
        key={letter}
        onClick={() => addGuessedLetter(letter)}
      >
        {letter.toUpperCase()}
      </button>
    )
  })

  function newGame() {
    setCurrentWord(() => getRandomWord())
    setGuessedLetters([])
  }

  const statStyling = clsx("game-status", {lost: isGameLost, won: isGameWon, farewell: !isGameOver && isLastGuessIncorrect})

  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      return (
        <>
          <h2>{getFarewellText(languages[wrongGuessCount - 1].name)}</h2>
        </>
      )
    }
    if (isGameWon) {
      return (
        <>
          <Confetti recycle={false} numberOfPieces={1000} />
          <h2>You win!</h2>
          <p>Well done! 🎉</p>
        </>
      )
    }
    if (isGameLost) {
      return (
        <>
          <h2>Game over!</h2>
          <p>You lose! Better start learning Assembly 😭</p>
        </>
      )
    }
    return null
  }

  return (
    <main>
      <header>
        <h1>Assembly: Endgame</h1>
        <p>Guess the word in under 8 attempts to keep the programming world sage from Assembly</p>
      </header>
      <section aria-live="polite" role="status" className={statStyling}>
        {renderGameStatus()}
      </section>
      <section className="language-chips">
        {languageElements}
      </section>
      <section className="word">{letterElements}</section>
      {/* {Combined visually-hidden aria-live region for status updates} */}
      <section 
          className="sr-only" 
          aria-live="polite" 
          role="status"
        >
          <p>{currentWord.includes(lastGuessedLetter) ? 
          `Correct! The letter ${lastGuessedLetter} is in the word.` : 
          `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
          You have {numGuessesLeft} attempts left.</p>
          <p>Current word: {currentWord.split("").map(letter => 
            guessedLetters.includes(letter) ? letter + "." : "blank.").join(" ")}</p>
        </section>
      <section className="keyboard">{keyboardElements}</section>
      {isGameOver && <button onClick={newGame} className="new-game">New Game</button>}
    </main>
  )
}