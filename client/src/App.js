import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // import this second so it overwrites some bootstrap defaults 
import SpotifyWebApi from 'spotify-web-api-js';
import {Tab, Tabs, TabContainer} from 'react-bootstrap';
import { ReactComponent as LogoSvg } from './logo1.svg';
const spotifyApi = new SpotifyWebApi();


function msToTime(duration) {
    var seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)

    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return minutes + ":" + seconds;
}

function utcTimeToHumanReadable(utcTime) {
    const date = new Date(utcTime);
    let [year, month, day] = [date.getUTCFullYear(), date.getUTCMonth()+1, date.getUTCDate()];
    month = (month < 10) ? "0" + month : month;
    day = (day < 10) ? "0" + day : day;
    return `${year}-${month}-${day}`;
}

// prop1 is 'track' and prop2 is 'uri'
function removeDuplicates(myArr, prop1, prop2) {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop1][prop2]).indexOf(obj[prop1][prop2]) === pos;
    });
}

class App extends React.Component {
  constructor() {
      super();
      const params = this.getHashParams();
      console.log(params);
      const token = params.access_token;
      if (token) {
          spotifyApi.setAccessToken(token);
      }
      this.state = {
          loggedIn: token ? true : false,
          name: '',
          userId: '',
          playlistIds: '',
          playlistData: [],
          songs: [],
          playlists: [],
      }
      this.getUserPlaylists = this.getUserPlaylists.bind(this);
      this.getUserSavedTracks = this.getUserSavedTracks.bind(this);
      this.getTracks = this.getTracks.bind(this);
      this.logState = this.logState.bind(this);
      this.sortSongsByDate = this.sortSongsByDate.bind(this);
      this.createPlaylists = this.createPlaylists.bind(this);
      this.getPlayListSongsByQuery = this.getPlayListSongsByQuery.bind(this);
      this.getAllPlaylistsOnComponentMount = this.getAllPlaylistsOnComponentMount.bind(this);

  }
    componentDidMount() {
        spotifyApi.getMe().then((res) => {
            console.log(res);
            this.setState({name: res.display_name, userId: res.id})});
    }
    getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }
    async getUserPlaylists() {
            try {
                let offset = 0;
                let ids;
                let newRes; 
                let userName = this.state.name;
                let playlistIds = [];
                do {
                    newRes = await spotifyApi.getUserPlaylists({offset: offset, limit: 50});
                    console.log(newRes);
                    offset += 50;
                    console.log(newRes);
                    ids = newRes.items.filter(playlist => playlist.owner.display_name === userName).map(playlist => { return {id: playlist.id, length: playlist.tracks.total}});
                    playlistIds = [...playlistIds, ...ids];
                } while(newRes.next);
                this.setState({playlistIds: playlistIds});
                return 'success';
            } catch (err) {
                console.log(err);
            }
        return 'failure';
    }
    async getPlaylistSongs(playlistId) {
        try {
            let offset = 0;
            let newRes;
            let songs = [];
            do {
                newRes = await spotifyApi.getPlaylistTracks(playlistId, {offset: offset});
                offset += 100;
                this.setState({songs: [...newRes.items, ...this.state.songs]});
/*
                songs = [...songs, newRes.items]
*/
            } while (newRes.next);
/*
//Comment this out try setting state in each call instead
            return songs;
*/
        } catch (err) {
            console.log(err);
    /*        let header = err.getAllResponseHeaders();
            const regex = /[\d];
            const retryAfter = header
            console.log(seconds);
            console.log(err);
            console.log(err.headers);*/
        }
    }
    getTracks () {
        this.state.playlistIds.map(playlist => this.getPlaylistSongs(playlist.id));
    }
    
    getPlayListSongsByQuery() {
        // Create a query parameters object
        let obj = [
            {id: '4q0BIH735bO4dt6iLlhHJt', offset: 0},
            {id: '4q0BIH735bO4dt6iLlhHJt', offset: 100},
            {id: '4q0BIH735bO4dt6iLlhHJt', offset: 200},
            {id: '62EdnTtiwrCheeuaYoQQre', offset: 0}
        ];
        obj.forEach(async (playlist) => {
            let newRes = await spotifyApi.getPlaylistTracks(playlist.id, {offset: playlist.offset});
            console.log(newRes);
            this.setState({songs: [...newRes.items, ...this.state.songs]});
        })
    }
    
/*        getTracks() {
        if (this.state.playlistIds === '') return;
        let songs = [];
        this.state.playlistIds.map(id => {
            let newRes;
            newRes = this.getPlaylistSongs(id);
        });
        this.setState({songs: [...songs, ...this.state.songs]});
    }*/
    async getUserSavedTracks() {
      try {
            let offset = 0;
            let newRes;
          let tracks = [];
            do {
              newRes = await spotifyApi.getMySavedTracks({offset: offset, limit: 50}).then((res) => res);
              offset += 50;
              tracks = [...tracks, ...newRes.items];
            } while (newRes.next);
        this.setState({songs: [...tracks, ...this.state.songs]});
      } catch (err) {
        console.log(err);
      }
}
    logState() {
        console.log(this.state);
    }
    sortSongsByDate() {
        let songsArraySortedByDate = this.state.songs.sort((song1, song2) => {
            const date1 = new Date(song1.added_at);
            const date2 = new Date(song2.added_at);
            return date1 > date2 ? -1 : 1;
        });
        this.setState({songs: songsArraySortedByDate})
    }
    
    range(start, stop, step) {
    var a = [start], b = start;
    while (b > stop) {
        a.push(b += step);
    }
    return a;
    }
    
    createOneYearResponseObject(year) {
    const names = [{season: 'Fall',   months: [8, 9, 10]},  //months start with index=0
                   {season: 'Summer', months: [5, 6, 7]},
                   {season: 'Spring', months: [2, 3, 4]},
                   {season: 'Winter', months: [11, 0, 1]}];
    return names.map(object => {
        return {name: object.season + ' ' + year,
               year: year,
               months: object.months,
               songs: []};
    });
    }
    
    createResponseObject(dateLastSongAdded, dateFirstSongAdded) {
        if (!dateFirstSongAdded) return;
    const lastYear = new Date(dateLastSongAdded).getFullYear();
    const firstYear = new Date(dateFirstSongAdded).getFullYear();
    const yearRange = this.range(lastYear, firstYear, -1);
    let result = [];
    yearRange.forEach(year => {
        const oneYearResponse = this.createOneYearResponseObject(year);
        result = [...result, ...oneYearResponse];
    });
    return result;
    }
    createPlaylists() {
        let playlists = this.createResponseObject(this.state.songs[0].added_at,
                                                  this.state.songs[this.state.songs.length - 1].added_at);
        const songs = this.state.songs; 
        songs.forEach(song => {
            const songDate = new Date(song.added_at);
            const [songYear, songMonth] = [songDate.getFullYear(), songDate.getUTCMonth()];
            
            playlists.forEach(playlist => {
                if (songYear === playlist.year && playlist.months.includes(songMonth)) {
                    playlist.songs.push(song);
                }
            });
        });
        
        // Filter out zero length playlists and remove duplicate songs
        playlists = playlists.filter(playlist => playlist.songs.length > 0);
        playlists.forEach(playlist => {
            playlist.songs = removeDuplicates(playlist.songs, 'track', 'uri');
        });
        
        this.setState({playlists: playlists});
        // Save to localStorage
        const playlistNames = playlists.map(playlist => playlist.name);
        localStorage.setItem('playlistNames', JSON.stringify(playlistNames));
        localStorage.setItem("Summer19", JSON.stringify(playlists[1]));
    }
/*    getTracks() {
        // probably need playlist length BEFORE if that's possible
        let offset = 0;
        let songsRemaining = 0;
        const id = this.state.playlistResObject.items[0].id;
        const numberOfSongs = this.state.playlistResObject.tracks.total;
        while (songsRemaining < 2) {
            spotifyApi.getPlaylistTracks(id, {offset: offset})
                .then((res) => {
                console.log(res);
                console.log(songsRemaining);
                songsRemaining ++ ;
                offset += 100;
            });
     }
    }*/
/*   
// this doesn't work - probably because it's asynchronous
getTracks(playlistId) {
        let offset = 0;
        let tracks = [];
        let songsRemaining = true;
        const id = this.state.playlistResObject.items[0].id
        while (songsRemaining) {
            spotifyApi.getPlaylistTracks(id, {offset: 100})
                .then((res) => {
                console.log(res);
                offset += 100;
                console.log(songsRemaining);
                if (!res.next) songsRemaining = false;
            });
     }
    }*/
    async getAllPlaylistsOnComponentMount() {
        // this is way too hacky - refactor to use promises
        // leaving this here so i can demonstrate how the app works 
        this.getUserPlaylists();
        this.getUserSavedTracks();
        setTimeout(() => {this.getTracks()}, 1000);
        setTimeout(() => {this.sortSongsByDate()}, 2500);
        setTimeout(() => {this.createPlaylists()}, 3000);
    }
/*    testPromise() {
        let newRes = spotifyApi.getUserPlaylists({offset: offset, limit: 50});
        ids = newRes.items.filter(playlist => playlist.owner.display_name === userName).map(playlist => { return {id: playlist.id, length: playlist.tracks.total}});
                    playlistIds = [...playlistIds, ...ids];
    }*/
  render() {
    return (
      <div className="App">
        <Login loggedIn={this.state.loggedIn}/>
        <div className={(this.state.loggedIn) ? 'homepage display-fullScreen' : 'homepage display-none'}> 
            <Navbar />
            <Playlists loggedIn={this.state.loggedIn} playlists={this.state.playlists} active = {(this.state.playlists.length > 0 ? true : false)}/>
        </div>
        <div className='temporaryNav'>
            <button onClick={this.getUserPlaylists}>Get Playlists</button><br/>
            <button onClick={this.getUserPlaylistsConsumePromise}>Get Playlists Promise</button><br/>
            <button onClick={this.getTracks}>Get Tracks</button><br/>
            <button onClick={this.testPromise}>testPromise</button><br/>
            <button onClick={this.getPlayListSongsByQuery}>Get Tracks Manual Queries</button><br/>
            <button onClick={this.getUserSavedTracks}>Get Saved Tracks</button><br/>
            <button onClick={this.sortSongsByDate}>Sort Songs</button><br/>
            <button onClick={this.logState}>Log State</button><br/>
            <button onClick={this.createPlaylists}>Create playlists</button><br/>
            <button onClick={this.getAllPlaylistsOnComponentMount}>getAllPlaylistsOnComponentMount</button><br/>
        </div>
    </div>
    );
  }
}

// Pass App.state.loggedIn in as props.  Then the component will render based off whether it's true / false
const Login = (props) => {
    return (
        <div className={props.loggedIn ? "Login display-none" : "Login display-fullScreen"}>
            <Navbar />
            <div className='Login-container'>
            <h1>Smarter Playlists</h1>
            <div style={{'maxWidth': '40vw'}}>Welcome to smart playlists - the app that aggregates your music into periodical playlists so you don't have to!</div>
            <a className='Login-button' href='http://localhost:8888/login' >Login with Spotify </a>
            </div>
        </div>
        );
}

const Navbar = () => {
    return(
        <div className='Navbar'>
            <ul>
                <li><a href="http://github.com/dmullen17" target="_blank">Github</a></li>
                <li><a href="https://www.linkedin.com/in/dominic-mullen-a84a2452/" target="_blank">LinkedIn</a></li>
                <li><a href="http://github.com/dmullen17" target="_blank">Contact</a></li>
                <li>|</li>
                <li><a href="http://venmo.com/Dominic-Mullen" target="_blank">Donate</a></li>
                <li><a href="http://localhost:3000"><LogoSvg style={{'height': '60px', 'position': 'absolute', 'right': '10vw', 'top': '30px', 'fill': 'white'}}/></a></li>
            </ul>
        </div>
    );
}

// We can call the spotifyApi from child components as well.  There is no need to pass the token down.  It gets globally assigned in the module.
class Playlists extends React.Component {
    // Try to get playlist names from localStorage - delete this in app production later.
    constructor(props) {
        super(props);   
        this.state = {
            selectedPlaylistName: '',
            userId: ''
        }
        this.addPlaylistToLibrary = this.addPlaylistToLibrary.bind(this);
        this.updateSelectedPlaylist = this.updateSelectedPlaylist.bind(this);
    }
    addPlaylistToLibrary() {
        const selectedPlaylistName = this.state.selectedPlaylistName;
        const playlist = this.props.playlists.filter(playlist => playlist.name === selectedPlaylistName);
        console.log(playlist);
        const songURIs = playlist[0].songs.map(song => song.track.uri);
        const userId = this.state.userId;
        
        // Create the playlist 
        spotifyApi.createPlaylist(userId, {name: selectedPlaylistName})
            .then((res) => {
                const playlistId = res.id;
                let offset = 0;
                const iterations = Math.ceil(songURIs.length / 100);
                for (let i=1; i<=iterations; i++) {
                    spotifyApi.addTracksToPlaylist(playlistId, songURIs.slice(0 + offset, 100 + offset));
                    offset += 100;
                }
        });
    }
    /* REmove this and pass it down as props from App class */
    componentDidMount() {
        spotifyApi.getMe().then((res) => this.setState({userId: res.id}));
    }
    updateSelectedPlaylist(value) {
        this.setState({selectedPlaylistName: value});
    }
    render() {
        let playlistTabs;
        /*const playlist = JSON.parse(localStorage.getItem("Summer19"));
        playlistTabs = <Tab title={playlist.name} eventKey={playlist.name}><Playlist songs={playlist.songs}/></Tab>*/
        playlistTabs = this.props.playlists.map(playlist => <Tab title={playlist.name} eventKey={playlist.name}><Playlist songs={playlist.songs}/></Tab>);
        return (
            <div className='createPlaylistsContainer'>
                <div className={ (this.props.active) ? 'Login-container display-none' : 'Login-container'}>
                    <h1>Smarter Playlists</h1>
                    <div style={{'maxWidth': '60vw'}}>This app retrieves all the songs in your playlists and saved tracks.  It then sorts them into 3-month aggregate playlists. Now you always have a playlist of all your new music!</div>
                    <div className='Login-button'>Create smart playlists</div>
                </div>
                <div className= {(this.props.active) ? 'addPlaylistButton' : 'addPlaylistButton display-none'} onClick={this.addPlaylistToLibrary}>Add playlist to library</div>
                <TabContainer>
                    <Tabs className='playLists' onSelect={this.updateSelectedPlaylist}>
                        {playlistTabs}
                    </Tabs>
                </TabContainer>
            </div>
        );
    }
}
    
const Playlist = (props) => {
    const songList = props.songs.map(song => <li><Song name={song.track.name} artist={song.track.artists[0].name} album={song.track.album.name} added_at={song.added_at} duration={song.track.duration_ms}/></li>);
    return (
        <ul className='playlist'>
            {songList}
        </ul>
    );
}
    
const Song = (props) => {
    return (
        <div>
            <ul className='songsUlContainer'>
                <li className='name'>{props.name}</li>
                <li className='.li-artist'>{props.artist}</li>
                <li className='.li-album'>{props.album}</li>
                <li className='.li-added_at'>{utcTimeToHumanReadable(props.added_at)}</li>
                <li className='.li-duration'>{msToTime(props.duration)}</li>
            </ul>
        </div>
    );
}

export default App;



/*

Constr.prototype.getPlaylist = function(playlistId, options, callback) {
    var requestData = {
      url: _baseUri + '/playlists/' + playlistId
    };
    return _checkParamsAndPerformRequest(requestData, options, callback);
  };
  
  
  var _checkParamsAndPerformRequest = function(requestData, options, callback, optionsAlwaysExtendParams) {
    var opt = {};
    var cb = null;

    if (typeof options === 'object') {
      opt = options;
      cb = callback;
    } else if (typeof options === 'function') {
      cb = options;
    }

    // options extend postData, if any. Otherwise they extend parameters sent in the url
    var type = requestData.type || 'GET';
    if (type !== 'GET' && requestData.postData && !optionsAlwaysExtendParams) {
      requestData.postData = _extend(requestData.postData, opt);
    } else {
      requestData.params = _extend(requestData.params, opt);
    }
    return _performRequest(requestData, cb);
  };

var _performRequest = function(requestData, callback) {
    var req = new XMLHttpRequest();

    var promiseFunction = function(resolve, reject) {
      function success(data) {
        if (resolve) {
          resolve(data);
        }
        if (callback) {
          callback(null, data);
        }
      }

      function failure() {
        if (reject) {
          reject(req);
        }
        if (callback) {
          callback(req, null);
        }
      }

      var type = requestData.type || 'GET';
      req.open(type, _buildUrl(requestData.url, requestData.params));
      if (_accessToken) {
        req.setRequestHeader('Authorization', 'Bearer ' + _accessToken);
      }
      if (requestData.contentType) {
        req.setRequestHeader('Content-Type', requestData.contentType)
      }

      req.onreadystatechange = function() {
        if (req.readyState === 4) {
          var data = null;
          try {
            data = req.responseText ? JSON.parse(req.responseText) : '';
          } catch (e) {
            console.error(e);
          }

          if (req.status >= 200 && req.status < 300) {
            success(data);
          } else {
            failure();
          }
        }
      };

      if (type === 'GET') {
        req.send(null);
      } else {
        var postData = null
        if (requestData.postData) {
          postData = requestData.contentType === 'image/jpeg' ? requestData.postData : JSON.stringify(requestData.postData)
        }
        req.send(postData);
      }
    };

    if (callback) {
      promiseFunction();
      return null;
    } else {
      return _promiseProvider(promiseFunction, function() {
        req.abort();
      });
    }
  };

*/ 
