
function getTTSVoices() {
  let voices = window.speechSynthesis.getVoices();
  return voices;
}

function textToSpeech(text, voice, rate) {
  let msg = new SpeechSynthesisUtterance();
  msg.text = text;
  msg.voice = voice;
  msg.rate = rate;

  //maybe don't play, just return the synth? so that we can control it later play/pause>
  speechSynthesis.cancel(); //bugfix? sometimes doesn't play or show error? - related to needing user trigger?
  speechSynthesis.speak(msg);
  msg.onerror = function (event) {
    console.log(
      'An error has occurred with the speech synthesis: ' + event.error
    );
  };
  // msg.onend = function (event) {
  //   console.log(
  //     'Utterance has finished being spoken after ' +
  //       event.elapsedTime +
  //       ' milliseconds.'
  //   );
  // };
  return speechSynthesis;
}

export { textToSpeech, getTTSVoices };
