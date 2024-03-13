import { useState, useEffect, useRef } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const [currMsg, setCurrMsg] = useState('');
  const [currReply, setCurrReply] = useState('');
  const [streamData, setStreamData] = useState('');
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const submitRef = useRef(null);
  const divRef = useRef(null);

  useEffect(() => {
    const div = divRef.current;

    const handleScroll = () => {
      setIsAutoScrolling(false)
    };
    const handleScrollEnd = () => {
      setIsAutoScrolling(true)
    };

    div.addEventListener('scroll', handleScroll);
    div.addEventListener('scrollend', handleScrollEnd);

    // Cleanup event listener
    return () => {
      div.removeEventListener('scroll', handleScroll);
      div.removeEventListener('scrollend', handleScrollEnd);
    };
  }, []);

  useEffect(() => {
    // Function to append a span of text to the div
    // console.log(isAutoScrolling);
    const appendText = () => {
      const replyContent = JSON.parse(currReply)['response']
      const newSpan = document.createElement('span');
      newSpan.textContent = replyContent;
      const list = document.querySelectorAll('.reply-container')
      list[list.length - 1].appendChild(newSpan)
      if (replyContent[replyContent.length - 1] === '\n') {
        list[list.length - 1].appendChild(document.createElement('br'));
      }
      if (JSON.parse(currReply)['done']) {
        const lastReply = document.createElement('div');
        lastReply.classList.add('reply-container')
        document.getElementById('conversations').append(lastReply);
        setCurrMsg('');
      }
    };

    // Call the appendText function whenever currReply changes
    if (currReply) {
      appendText();
    }

    if (isAutoScrolling) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }

    }, [currReply]);

  const handleChange = (e) => {
    setCurrMsg(e.target.value);
  };

  const fetchData = async () => {
    const newSpan = document.createElement('span');
    newSpan.textContent = currMsg;
    const list = document.querySelectorAll('.reply-container')
    list[list.length - 1].appendChild(newSpan)
    list[list.length - 1].classList.add('me')
    const lastReply = document.createElement('div');
    lastReply.classList.add('reply-container')
    document.getElementById('conversations').append(lastReply);
    setCurrMsg('');
    const payload = {
      model: 'llama2-uncensored',
      prompt: currMsg,
      stream: true
    };
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const reader = response.body.getReader();
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const reply = new TextDecoder('utf-8').decode(value)
        result += reply;

        // If you want to update the state for each chunk, you can do it here
        setStreamData(result);
        setCurrReply((reply));
      }
      // Finalize processing
      // console.log(JSON.parse(result));
    } catch (error) {
      console.error('Error:', error);
      // Handle error
    }
  };

  const handleEnterKey = (event) => {
    if (event.key === 'Enter') {
      submitRef.current.click();
    }
  }

  return (
    <>
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container">
      <a class="navbar-brand" href="#">ChatJPT+</a>
      <div class="d-flex justify-content-end w-100">
        <span>Fully Uncensored</span>
      </div>
    </div>
  </nav>
      <div className="container pb-5 mother">
        <div id="conversations" ref={divRef}>

          <div className="reply-container">
            

          </div>
          <div id='scroll-point'></div>
        </div>
        <div className="row">
          <div className="col">
            <input
              type="text"
              className="form-control custom-rounded"
              placeholder="Enter your text..."
              value={currMsg}
              onChange={handleChange}
              onKeyPress={handleEnterKey}
            />
          </div>
          <div className="col-auto">
            <button ref={submitRef} className="btn btn-primary custom-rounded" onClick={fetchData}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>

      </div>
    </>
  )
}

export default App
