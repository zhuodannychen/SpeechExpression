const path = require('path');
const express = require('express');
const app = express();
// const publicPath = path.join(__dirname, './client/build');
const port = process.env.PORT || 3000;

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req, res)=>{
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}

// app.use(express.static(path.resolve(__dirname, "./client/build")));
// app.use(express.static(publicPath));

// app.get('*', (req, res) => {
//    res.sendFile(path.join(publicPath, 'index.html'));
// });

app.listen(port, () => {
   console.log('Server is up!');
});