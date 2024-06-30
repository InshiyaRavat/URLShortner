import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import { useState } from 'react';
function App() {
  const [id,setId] = useState('')
  async function handleSubmit(e){
    e.preventDefault()
    console.log("calling post api",url)
    const response = await axios.post('http://localhost:5000/shorten',{url})
    console.log(response.data)
    setId(response.data)
  }
  const [url,setUrl] =  useState('')
  function handleChange(e){
    e.preventDefault();
    setUrl(e.target.value)
  }
  async function callShortUrl(){
    console.log("calling get api")
    console.log(id)
    const response = await axios.get(`http://localhost:5000/${id}`)
    console.log(response.data)
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          WELCOME TO URL SHORTNER
        </p>
          <form onSubmit={handleSubmit}>
              <input type="text" onChange={handleChange} name="url" placeholder="Enter URL" required/>
              <button type="submit">Shorten</button>
          </form>

          <br/>
          <a onClick={callShortUrl}>shortUrl</a>
      </header>
    </div>
  );
}

export default App;
