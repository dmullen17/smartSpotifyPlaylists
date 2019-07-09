# Smart Spotify Playlists 

Welcome to my smart playlists application!  This app uses Spotify's API to return all of the songs a user has either added to a playlist or their saved songs. It then sorts them by date and returns a 3-month subsets of songs - available for the user to add to their library. The front end was built using React and Bootstrap, and the back-end uses Node.js and Express to handle authentication.    

## Using this application 
I have not yet set up this application on a live server.  However you can still use it on your local machine if you would like to.  

Download or clone this repository 
```
git clone https://github.com/dmullen17/smartSpotifyPlaylists.git
```

Open two command lines tabs and navigate to the `authorization_code` and `client` directories.

From the `authorization_code` directory start the node server. 
```
node App.js
```

From the `client` directory launch the React app 
```
npm start src/app.js
```

Open a web browser and navigate to `http://localhost:3000/`
